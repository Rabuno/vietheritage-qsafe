from fastapi import FastAPI
from .config import settings

app = FastAPI(title=settings.APP_NAME)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "pqc_backend": "Mock-PQ-Demo",
        "version": "0.1.0"
    }
