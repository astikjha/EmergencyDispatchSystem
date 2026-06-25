from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import db_models  # this import registers the models with Base

# Creates all tables in PostgreSQL if they don't exist yet
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

@app.get("/")
def root():
    return {"message": "Emergency Dispatch System is running", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}