from fastapi import FastAPI
from .config import settings
from .db import engine, Base
from . import models
from .routers import assets, benchmarks

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

app.include_router(assets.router, prefix="/api")
app.include_router(benchmarks.router, prefix="/api")

# Test comment
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "pqc_backend": "Mock-PQ-Demo",
        "version": "0.1.0"
    }
