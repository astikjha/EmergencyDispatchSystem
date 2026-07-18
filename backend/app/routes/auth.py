from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.schemas import (
    PatientRegister, HospitalRegister, DriverRegister,
    AdminRegister, LoginRequest, TokenResponse, UserResponse
)
from app.services.auth_service import AuthService
from app.models.db_models import UserModel

router = APIRouter(prefix="/auth", tags=["Authentication"])
service = AuthService()


@router.post("/register/patient", response_model=UserResponse)
def register_patient(data: PatientRegister, db: Session = Depends(get_db)):
    return service.register_patient(db, data)


@router.post("/register/hospital", response_model=UserResponse)
def register_hospital(data: HospitalRegister, db: Session = Depends(get_db)):
    return service.register_hospital(db, data)


@router.post("/register/driver", response_model=UserResponse)
def register_driver(data: DriverRegister, db: Session = Depends(get_db)):
    return service.register_driver(db, data)


@router.post("/register/admin", response_model=UserResponse)
def register_admin(data: AdminRegister, db: Session = Depends(get_db)):
    return service.register_admin(db, data)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return service.login(db, data.email, data.password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.db_models import PatientModel, HospitalModel, AmbulanceModel
    
    # Build response with coordinates from linked entity
    response_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "is_active": current_user.is_active,
        "patient_id": current_user.patient_id,
        "hospital_id": current_user.hospital_id,
        "ambulance_id": current_user.ambulance_id,
        "latitude": None,
        "longitude": None,
    }

    if current_user.patient_id:
        patient = db.query(PatientModel).filter(
            PatientModel.id == current_user.patient_id
        ).first()
        if patient:
            response_data["latitude"] = patient.latitude
            response_data["longitude"] = patient.longitude

    elif current_user.hospital_id:
        hospital = db.query(HospitalModel).filter(
            HospitalModel.id == current_user.hospital_id
        ).first()
        if hospital:
            response_data["latitude"] = hospital.latitude
            response_data["longitude"] = hospital.longitude

    elif current_user.ambulance_id:
        ambulance = db.query(AmbulanceModel).filter(
            AmbulanceModel.id == current_user.ambulance_id
        ).first()
        if ambulance:
            response_data["latitude"] = ambulance.latitude
            response_data["longitude"] = ambulance.longitude

    return response_data

from pydantic import BaseModel as PydanticBaseModel

class LocationUpdate(PydanticBaseModel):
    latitude: float
    longitude: float

@router.post("/update-location")
def update_patient_location(
    data: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.patient_id:
        from app.models.db_models import PatientModel
        patient = db.query(PatientModel).filter(
            PatientModel.id == current_user.patient_id
        ).first()
        if patient:
            patient.latitude = data.latitude
            patient.longitude = data.longitude
            db.commit()
    return {"status": "location updated"}