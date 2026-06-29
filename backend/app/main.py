from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import db_models
from app.routes import ambulance, hospital, emergency

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Emergency Dispatch System",
    description="AI-Powered Real-Time Emergency Response",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(ambulance.router)
app.include_router(hospital.router)
app.include_router(emergency.router)

@app.get("/")
def root():
    return {"message": "Emergency Dispatch System is running", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}