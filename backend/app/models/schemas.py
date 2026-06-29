from pydantic import BaseModel
from typing import Optional
from enum import Enum


class AmbulanceStatus(str, Enum):
    available = "available"
    busy = "busy"
    off_duty = "off_duty"


class SeverityLevel(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class EmergencyStatus(str, Enum):
    pending = "pending"
    dispatched = "dispatched"
    en_route = "en_route"
    completed = "completed"
    cancelled = "cancelled"


# ── Ambulance schemas ──────────────────────────────────────
class AmbulanceCreate(BaseModel):
    # What the client sends when creating an ambulance
    vehicle_number: str
    driver_name: str
    latitude: float
    longitude: float

class AmbulanceResponse(BaseModel):
    # What we send back to the client
    id: str
    vehicle_number: str
    driver_name: str
    latitude: float
    longitude: float
    status: AmbulanceStatus

    class Config:
        from_attributes = True  # allows converting SQLAlchemy model to this schema


# ── Hospital schemas ───────────────────────────────────────
class HospitalCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    total_beds: int

class HospitalResponse(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    total_beds: int
    available_beds: int

    class Config:
        from_attributes = True


# ── Emergency schemas ──────────────────────────────────────
class EmergencyCreate(BaseModel):
    # What the client sends when reporting an emergency
    patient_name: str
    patient_age: int
    symptoms: str
    emergency_type: str
    latitude: float
    longitude: float

class EmergencyResponse(BaseModel):
    id: str
    emergency_type: str
    severity: str
    status: str
    eta_minutes: Optional[float] = None
    patient_id: str
    ambulance_id: Optional[str] = None
    hospital_id: Optional[str] = None

    class Config:
        from_attributes = True