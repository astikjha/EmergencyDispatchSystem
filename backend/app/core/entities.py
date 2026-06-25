from datetime import datetime
from enum import Enum
import uuid


# ─── Enums ───────────────────────────────────────────────
# Enums restrict a field to only valid values.
# For example, an ambulance can only be AVAILABLE, BUSY, or OFF_DUTY.
# This prevents bugs like someone setting status to "free" or "occupied" by mistake.

class AmbulanceStatus(Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    OFF_DUTY = "off_duty"

class SeverityLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class EmergencyStatus(Enum):
    PENDING = "pending"
    DISPATCHED = "dispatched"
    EN_ROUTE = "en_route"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ─── Base Class ───────────────────────────────────────────
# Every entity in our system has an id and a creation timestamp.
# Instead of repeating these in every class, we define them once here.
# This is encapsulation + inheritance working together.

class BaseEntity:
    def __init__(self):
        self.id = str(uuid.uuid4())       # unique ID for every object
        self.created_at = datetime.now()  # timestamp when object was created

    def to_dict(self):
        # Converts the object to a dictionary so FastAPI can return it as JSON
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat()
        }


# ─── Ambulance ────────────────────────────────────────────
# Represents a real ambulance in the system.
# Inherits id and created_at from BaseEntity.

class Ambulance(BaseEntity):
    def __init__(self, vehicle_number: str, driver_name: str, latitude: float, longitude: float):
        super().__init__()  # calls BaseEntity.__init__() to set id and created_at
        self.vehicle_number = vehicle_number
        self.driver_name = driver_name
        self.latitude = latitude
        self.longitude = longitude
        self.status = AmbulanceStatus.AVAILABLE  # default status when created

    def assign(self):
        # Called when this ambulance is dispatched to an emergency
        self.status = AmbulanceStatus.BUSY

    def release(self):
        # Called when the emergency is completed
        self.status = AmbulanceStatus.AVAILABLE

    def is_available(self) -> bool:
        return self.status == AmbulanceStatus.AVAILABLE

    def to_dict(self):
        base = super().to_dict()  # get id and created_at from parent
        base.update({
            "vehicle_number": self.vehicle_number,
            "driver_name": self.driver_name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status.value
        })
        return base


# ─── Hospital ─────────────────────────────────────────────
# Represents a hospital that can receive patients.

class Hospital(BaseEntity):
    def __init__(self, name: str, latitude: float, longitude: float, total_beds: int):
        super().__init__()
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.total_beds = total_beds
        self.available_beds = total_beds  # starts fully available

    def admit_patient(self):
        if self.available_beds > 0:
            self.available_beds -= 1
            return True
        return False  # hospital is full

    def discharge_patient(self):
        if self.available_beds < self.total_beds:
            self.available_beds += 1

    def has_capacity(self) -> bool:
        return self.available_beds > 0

    def to_dict(self):
        base = super().to_dict()
        base.update({
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "total_beds": self.total_beds,
            "available_beds": self.available_beds
        })
        return base


# ─── Patient ──────────────────────────────────────────────
# Represents the person who needs emergency help.

class Patient(BaseEntity):
    def __init__(self, name: str, age: int, symptoms: str, latitude: float, longitude: float):
        super().__init__()
        self.name = name
        self.age = age
        self.symptoms = symptoms
        self.latitude = latitude    # where the patient is located
        self.longitude = longitude

    def to_dict(self):
        base = super().to_dict()
        base.update({
            "name": self.name,
            "age": self.age,
            "symptoms": self.symptoms,
            "latitude": self.latitude,
            "longitude": self.longitude
        })
        return base


# ─── EmergencyRequest ─────────────────────────────────────
# This is the central object that connects everything.
# One emergency = one patient + one ambulance + one hospital + a severity level.

class EmergencyRequest(BaseEntity):
    def __init__(self, patient: Patient, emergency_type: str, severity: SeverityLevel):
        super().__init__()
        self.patient = patient
        self.emergency_type = emergency_type
        self.severity = severity
        self.status = EmergencyStatus.PENDING
        self.assigned_ambulance: Ambulance = None   # set when dispatched
        self.assigned_hospital: Hospital = None     # set when dispatched
        self.eta_minutes: float = None              # set after route calculation

    def dispatch(self, ambulance: Ambulance, hospital: Hospital, eta: float):
        # Links ambulance and hospital to this emergency and updates status
        self.assigned_ambulance = ambulance
        self.assigned_hospital = hospital
        self.eta_minutes = eta
        self.status = EmergencyStatus.DISPATCHED
        ambulance.assign()        # marks ambulance as BUSY
        hospital.admit_patient()  # reduces available beds

    def complete(self):
        self.status = EmergencyStatus.COMPLETED
        if self.assigned_ambulance:
            self.assigned_ambulance.release()  # marks ambulance as AVAILABLE again

    def to_dict(self):
        base = super().to_dict()
        base.update({
            "patient": self.patient.to_dict(),
            "emergency_type": self.emergency_type,
            "severity": self.severity.value,
            "status": self.status.value,
            "assigned_ambulance": self.assigned_ambulance.to_dict() if self.assigned_ambulance else None,
            "assigned_hospital": self.assigned_hospital.to_dict() if self.assigned_hospital else None,
            "eta_minutes": self.eta_minutes
        })
        return base