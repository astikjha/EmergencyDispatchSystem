from fastapi import APIRouter
from pydantic import BaseModel
from app.ml.severity_classifier import classifier

router = APIRouter(prefix="/ml", tags=["AI/ML"])

class PredictionRequest(BaseModel):
    symptoms: str
    emergency_type: str

@router.post("/predict-severity")
def predict_severity(request: PredictionRequest):
    result = classifier.predict_with_confidence(
        request.symptoms,
        request.emergency_type
    )
    return result