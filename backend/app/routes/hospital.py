from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import HospitalCreate, HospitalResponse
from app.services.dispatch_service import DispatchService

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])
service = DispatchService()

@router.post("/", response_model=HospitalResponse)
def create_hospital(data: HospitalCreate, db: Session = Depends(get_db)):
    return service.create_hospital(db, data)

@router.get("/", response_model=list[HospitalResponse])
def get_hospitals(db: Session = Depends(get_db)):
    return service.get_all_hospitals(db)