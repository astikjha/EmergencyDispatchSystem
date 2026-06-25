from sqlalchemy import Column, String, Float, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.core.database import Base
from datetime import datetime
import enum


class AmbulanceStatus(enum.Enum):
    available = "available"
    busy = "busy"
    off_duty = "off_duty"


class SeverityLevel(enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class EmergencyStatus(enum.Enum):
    pending = "pending"
    dispatched = "dispatched"
    en_route = "en_route"
    completed = "completed"
    cancelled = "cancelled"


class AmbulanceModel(Base):
    __tablename__ = "ambulances"  # this is the actual table name in PostgreSQL

    id = Column(String, primary_key=True)
    vehicle_number = Column(String, unique=True, nullable=False)
    driver_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(SQLEnum(AmbulanceStatus), default=AmbulanceStatus.available)
    created_at = Column(DateTime, default=datetime.now)


class HospitalModel(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_beds = Column(Integer, nullable=False)
    available_beds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)


class PatientModel(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    symptoms = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.now)


class EmergencyModel(Base):
    __tablename__ = "emergencies"

    id = Column(String, primary_key=True)
    emergency_type = Column(String, nullable=False)
    severity = Column(SQLEnum(SeverityLevel), nullable=False)
    status = Column(SQLEnum(EmergencyStatus), default=EmergencyStatus.pending)
    eta_minutes = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # Foreign keys — links this table to others
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    ambulance_id = Column(String, ForeignKey("ambulances.id"), nullable=True)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=True)

    # Relationships — lets us access related objects directly
    patient = relationship("PatientModel", foreign_keys=[patient_id])
    ambulance = relationship("AmbulanceModel", foreign_keys=[ambulance_id])
    hospital = relationship("HospitalModel", foreign_keys=[hospital_id])