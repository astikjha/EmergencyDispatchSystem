from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import EmergencyCreate, EmergencyResponse
from app.services.dispatch_service import DispatchService

router = APIRouter(prefix="/emergencies", tags=["Emergencies"])
service = DispatchService()

@router.post("/", response_model=EmergencyResponse)
def create_emergency(data: EmergencyCreate, db: Session = Depends(get_db)):
    return service.create_emergency(db, data)

@router.post("/{emergency_id}/dispatch")
def dispatch_emergency(emergency_id: str, db: Session = Depends(get_db)):
    result = service.dispatch_emergency(db, emergency_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
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