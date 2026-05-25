from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import BenchmarkResult
from ..schemas import BenchmarkRequest, BenchmarkResponse
from ..services.benchmark_service import BenchmarkService

router = APIRouter()
benchmark_service = BenchmarkService()

@router.post("/benchmarks/run", response_model=List[BenchmarkResponse])
def run_benchmarks(request: BenchmarkRequest, db: Session = Depends(get_db)):
    """
    Run benchmarks for Small and Medium profiles and save to database.
    """
    results = benchmark_service.run_benchmarks(
        runs_small=request.runs_small,
        runs_medium=request.runs_medium
    )
    
    for res in results:
        db.add(res)
    
    db.commit()
    for res in results:
        db.refresh(res)
        
    return results

@router.get("/benchmarks", response_model=List[BenchmarkResponse])
def get_benchmarks(db: Session = Depends(get_db)):
    """
    Retrieve benchmark history.
    """
    return db.query(BenchmarkResult).order_by(BenchmarkResult.created_at.desc()).all()
