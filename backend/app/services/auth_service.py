from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.db_models import UserModel, PatientModel, HospitalModel, AmbulanceModel
from app.models.db_models import UserRole, AmbulanceStatus
from app.models.schemas import PatientRegister, HospitalRegister, DriverRegister, AdminRegister
from app.core.auth import hash_password, verify_password, create_access_token
import uuid


class AuthService:

    def register_patient(self, db: Session, data: PatientRegister) -> UserModel:
        # Check email not already taken
        if db.query(UserModel).filter(UserModel.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create patient record
        patient = PatientModel(
            id=str(uuid.uuid4()),
            name=data.full_name,
            age=data.age,
            symptoms=data.symptoms,
            latitude=data.latitude,
            longitude=data.longitude
        )
        db.add(patient)
        db.commit()

        # Create user account linked to patient
        user = UserModel(
            id=str(uuid.uuid4()),
            email=data.email,
            hashed_password=hash_password(data.password),
            role=UserRole.patient,
            full_name=data.full_name,
            patient_id=patient.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def register_hospital(self, db: Session, data: HospitalRegister) -> UserModel:
        if db.query(UserModel).filter(UserModel.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create hospital record
        hospital = HospitalModel(
            id=str(uuid.uuid4()),
            name=data.full_name,
            latitude=data.latitude,
            longitude=data.longitude,
            total_beds=data.total_beds,
            available_beds=data.total_beds
        )
        db.add(hospital)
        db.commit()

        # Create user account linked to hospital
        user = UserModel(
            id=str(uuid.uuid4()),
            email=data.email,
            hashed_password=hash_password(data.password),
            role=UserRole.hospital,
            full_name=data.full_name,
            hospital_id=hospital.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def register_driver(self, db: Session, data: DriverRegister) -> UserModel:
        if db.query(UserModel).filter(UserModel.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Check vehicle number not already taken
        if db.query(AmbulanceModel).filter(AmbulanceModel.vehicle_number == data.vehicle_number).first():
            raise HTTPException(status_code=400, detail="Vehicle number already registered")

        # Create ambulance record
        ambulance = AmbulanceModel(
            id=str(uuid.uuid4()),
            vehicle_number=data.vehicle_number,
            driver_name=data.full_name,
            latitude=data.latitude,
            longitude=data.longitude,
            status=AmbulanceStatus.available
        )
        db.add(ambulance)
        db.commit()

        # Create user account linked to ambulance
        user = UserModel(
            id=str(uuid.uuid4()),
            email=data.email,
            hashed_password=hash_password(data.password),
            role=UserRole.driver,
            full_name=data.full_name,
            ambulance_id=ambulance.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def register_admin(self, db: Session, data: AdminRegister) -> UserModel:
        if db.query(UserModel).filter(UserModel.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        user = UserModel(
            id=str(uuid.uuid4()),
            email=data.email,
            hashed_password=hash_password(data.password),
            role=UserRole.admin,
            full_name=data.full_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def login(self, db: Session, email: str, password: str) -> dict:
        # Find user by email
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_active:
            raise HTTPException(status_code=400, detail="Account is deactivated")

        # Create JWT token with user info embedded
        token = create_access_token(data={
            "sub": user.id,
            "role": user.role.value,
            "email": user.email
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.role.value,
            "user_id": user.id,
            "full_name": user.full_name
        }