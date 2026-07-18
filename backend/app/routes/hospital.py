from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import HospitalCreate, HospitalResponse
from app.services.dispatch_service import DispatchService
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])
service = DispatchService()

@router.post("/", response_model=HospitalResponse)
def create_hospital(data: HospitalCreate, db: Session = Depends(get_db)):
    return service.create_hospital(db, data)

@router.get("/", response_model=list[HospitalResponse])
def get_hospitals(db: Session = Depends(get_db)):
    return service.get_all_hospitals(db)

@router.get("/{hospital_id}", response_model=HospitalResponse)
def get_hospital(hospital_id: str, db: Session = Depends(get_db)):
    hospital = service.get_all_hospitals(db)
    hosp = next((h for h in hospital if h.id == hospital_id), None)
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hosp