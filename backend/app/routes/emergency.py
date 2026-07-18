from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.schemas import EmergencyCreate, EmergencyResponse
from app.services.dispatch_service import DispatchService, assign_severity
from app.models.db_models import EmergencyModel, EmergencyStatus, UserModel
from app.core.auth import get_current_user
import uuid

router = APIRouter(prefix="/emergencies", tags=["Emergencies"])
service = DispatchService()


class PatientEmergencyCreate(BaseModel):
    symptoms: str
    emergency_type: str
    latitude: float
    longitude: float


@router.post("/report", response_model=EmergencyResponse)
async def report_my_emergency(
    data: PatientEmergencyCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if not current_user.patient_id:
        raise HTTPException(status_code=400, detail="Not a patient account")

    from app.models.db_models import PatientModel
    patient = db.query(PatientModel).filter(
        PatientModel.id == current_user.patient_id
    ).first()
    if patient:
        patient.latitude = data.latitude
        patient.longitude = data.longitude
        patient.symptoms = data.symptoms
        db.commit()

    severity = assign_severity(data.symptoms, data.emergency_type)

    emergency = EmergencyModel(
        id=str(uuid.uuid4()),
        emergency_type=data.emergency_type,
        severity=severity,
        status=EmergencyStatus.pending,
        patient_id=current_user.patient_id
    )
    db.add(emergency)
    db.commit()
    db.refresh(emergency)

    # Auto dispatch immediately
    result = await service.dispatch_emergency(db, emergency.id)
    if "error" in result:
        print(f"Auto-dispatch failed: {result['error']}")
    else:
        db.refresh(emergency)

    return emergency


@router.get("/my", response_model=list[EmergencyResponse])
def get_my_emergencies(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if not current_user.patient_id:
        return []
    return db.query(EmergencyModel).filter(
        EmergencyModel.patient_id == current_user.patient_id
    ).all()


@router.post("/", response_model=EmergencyResponse)
def create_emergency(data: EmergencyCreate, db: Session = Depends(get_db)):
    return service.create_emergency(db, data)


@router.post("/{emergency_id}/dispatch")
async def dispatch_emergency(emergency_id: str, db: Session = Depends(get_db)):
    result = await service.dispatch_emergency(db, emergency_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/{emergency_id}/complete")
async def complete_emergency(emergency_id: str, db: Session = Depends(get_db)):
    result = await service.complete_emergency(db, emergency_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/", response_model=list[EmergencyResponse])
def get_emergencies(db: Session = Depends(get_db)):
    return service.get_all_emergencies(db)


@router.get("/{emergency_id}", response_model=EmergencyResponse)
def get_emergency(emergency_id: str, db: Session = Depends(get_db)):
    emergency = service.get_emergency(db, emergency_id)
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emergency