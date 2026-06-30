from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schemas import AmbulanceCreate, AmbulanceResponse
from app.services.dispatch_service import DispatchService

router = APIRouter(prefix="/ambulances", tags=["Ambulances"])
service = DispatchService()

@router.post("/", response_model=AmbulanceResponse)
def create_ambulance(data: AmbulanceCreate, db: Session = Depends(get_db)):
    return service.create_ambulance(db, data)

@router.get("/", response_model=list[AmbulanceResponse])
def get_ambulances(db: Session = Depends(get_db)):
    return service.get_all_ambulances(db)

@router.get("/{ambulance_id}", response_model=AmbulanceResponse)
def get_ambulance(ambulance_id: str, db: Session = Depends(get_db)):
    ambulance = service.get_ambulance(db, ambulance_id)
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return ambulance

from pydantic import BaseModel

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float

@router.put("/{ambulance_id}/location")
async def update_location(ambulance_id: str, data: LocationUpdate, db: Session = Depends(get_db)):
    result = await service.update_ambulance_location(db, ambulance_id, data.latitude, data.longitude)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result