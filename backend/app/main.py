from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import engine, Base
from . import models
from .routers import assets, benchmarks

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For demo purposes, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router, prefix="/api")
app.include_router(benchmarks.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "pqc_backend": "Mock-PQ-Demo",
        "version": "0.1.0"
    }
