from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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