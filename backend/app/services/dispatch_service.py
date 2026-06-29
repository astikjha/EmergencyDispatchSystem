from sqlalchemy.orm import Session
from app.models.db_models import AmbulanceModel, HospitalModel, PatientModel, EmergencyModel
from app.models.db_models import AmbulanceStatus, SeverityLevel, EmergencyStatus
from app.models.schemas import AmbulanceCreate, HospitalCreate, EmergencyCreate
from app.core.entities import Ambulance, Hospital, Patient, EmergencyRequest
from app.core.entities import SeverityLevel as EntitySeverity
from app.core.route_planner import RoutePlanner
import uuid
from app.core.websocket_manager import manager


# RoutePlanner is expensive to initialize — create it once here
route_planner = RoutePlanner()

# Simple rule-based severity assignment
# Our ML model will replace this on Day 9
def assign_severity(symptoms: str, emergency_type: str) -> SeverityLevel:
    critical_keywords = ["cardiac", "heart attack", "unconscious", "not breathing", "stroke"]
    high_keywords = ["chest pain", "bleeding", "fracture", "accident"]
    medium_keywords = ["fever", "vomiting", "pain", "injury"]

    text = (symptoms + " " + emergency_type).lower()

    if any(k in text for k in critical_keywords):
        return SeverityLevel.critical
    elif any(k in text for k in high_keywords):
        return SeverityLevel.high
    elif any(k in text for k in medium_keywords):
        return SeverityLevel.medium
    else:
        return SeverityLevel.low


class DispatchService:

    # ── Ambulance operations ───────────────────────────────
    def create_ambulance(self, db: Session, data: AmbulanceCreate) -> AmbulanceModel:
        ambulance = AmbulanceModel(
            id=str(uuid.uuid4()),
            vehicle_number=data.vehicle_number,
            driver_name=data.driver_name,
            latitude=data.latitude,
            longitude=data.longitude,
            status=AmbulanceStatus.available
        )
        db.add(ambulance)
        db.commit()
        db.refresh(ambulance)
        return ambulance

    def get_all_ambulances(self, db: Session) -> list[AmbulanceModel]:
        return db.query(AmbulanceModel).all()

    def get_ambulance(self, db: Session, ambulance_id: str) -> AmbulanceModel:
        return db.query(AmbulanceModel).filter(AmbulanceModel.id == ambulance_id).first()

    # ── Hospital operations ────────────────────────────────
    def create_hospital(self, db: Session, data: HospitalCreate) -> HospitalModel:
        hospital = HospitalModel(
            id=str(uuid.uuid4()),
            name=data.name,
            latitude=data.latitude,
            longitude=data.longitude,
            total_beds=data.total_beds,
            available_beds=data.total_beds
        )
        db.add(hospital)
        db.commit()
        db.refresh(hospital)
        return hospital

    def get_all_hospitals(self, db: Session) -> list[HospitalModel]:
        return db.query(HospitalModel).all()

    # ── Emergency + Dispatch operations ───────────────────
    def create_emergency(self, db: Session, data: EmergencyCreate) -> EmergencyModel:
        # Step 1 — Save patient to database
        patient = PatientModel(
            id=str(uuid.uuid4()),
            name=data.patient_name,
            age=data.patient_age,
            symptoms=data.symptoms,
            latitude=data.latitude,
            longitude=data.longitude
        )
        db.add(patient)
        db.commit()

        # Step 2 — Determine severity
        severity = assign_severity(data.symptoms, data.emergency_type)

        # Step 3 — Create emergency record
        emergency = EmergencyModel(
            id=str(uuid.uuid4()),
            emergency_type=data.emergency_type,
            severity=severity,
            status=EmergencyStatus.pending,
            patient_id=patient.id
        )
        db.add(emergency)
        db.commit()
        db.refresh(emergency)
        return emergency

    async def dispatch_emergency(self, db: Session, emergency_id: str) -> dict:
        # Step 1 — Load emergency from DB
        emergency = db.query(EmergencyModel).filter(EmergencyModel.id == emergency_id).first()
        if not emergency:
            return {"error": "Emergency not found"}

        # Step 2 — Load patient
        patient_db = db.query(PatientModel).filter(PatientModel.id == emergency.patient_id).first()

        # Step 3 — Find available ambulances and hospitals
        available_ambulances = db.query(AmbulanceModel).filter(
            AmbulanceModel.status == AmbulanceStatus.available
        ).all()
        available_hospitals = db.query(HospitalModel).filter(
            HospitalModel.available_beds > 0
        ).all()

        if not available_ambulances:
            return {"error": "No ambulances available"}
        if not available_hospitals:
            return {"error": "No hospitals with capacity"}

        # Step 4 — Convert DB models to OOP entities
        patient_entity = Patient(
            patient_db.name, patient_db.age,
            patient_db.symptoms, patient_db.latitude, patient_db.longitude
        )
        ambulance_entities = [
            Ambulance(a.vehicle_number, a.driver_name, a.latitude, a.longitude)
            for a in available_ambulances
        ]
        hospital_entities = [
            Hospital(h.name, h.latitude, h.longitude, h.total_beds)
            for h in available_hospitals
        ]

        # Step 5 — Find nearest ambulance and hospital
        nearest_ambulance_entity, _ = route_planner.find_nearest_ambulance(patient_entity, ambulance_entities)
        nearest_hospital_entity, _ = route_planner.find_nearest_hospital(patient_entity, hospital_entities)

        # Step 6 — Calculate route
        route = route_planner.plan_route(nearest_ambulance_entity, patient_entity, nearest_hospital_entity)

        # Step 7 — Find DB records
        nearest_ambulance_db = next(
            a for a in available_ambulances
            if a.vehicle_number == nearest_ambulance_entity.vehicle_number
        )
        nearest_hospital_db = next(
            h for h in available_hospitals
            if h.name == nearest_hospital_entity.name
        )

        # Step 8 — Update database
        emergency.status = EmergencyStatus.dispatched
        emergency.ambulance_id = nearest_ambulance_db.id
        emergency.hospital_id = nearest_hospital_db.id
        emergency.eta_minutes = route["eta_minutes"]
        nearest_ambulance_db.status = AmbulanceStatus.busy
        nearest_hospital_db.available_beds -= 1
        db.commit()

        result = {
            "emergency_id": emergency.id,
            "status": "dispatched",
            "ambulance": nearest_ambulance_db.vehicle_number,
            "hospital": nearest_hospital_db.name,
            "route": route
        }

        # Step 9 — Broadcast to all connected WebSocket clients
        await manager.broadcast("emergency_dispatched", result)

        return result

    def get_all_emergencies(self, db: Session) -> list[EmergencyModel]:
        return db.query(EmergencyModel).all()

    def get_emergency(self, db: Session, emergency_id: str) -> EmergencyModel:
        return db.query(EmergencyModel).filter(EmergencyModel.id == emergency_id).first()