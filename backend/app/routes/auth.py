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
def get_me(current_user: UserModel = Depends(get_current_user)):
    # Returns currently logged in user's info
    return current_user