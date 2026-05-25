# VietHeritage-QSafe MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working research prototype for Vietnamese cultural heritage digital preservation using RSA-PSS and Mock-PQ signatures.

**Architecture:** FastAPI backend with SQLAlchemy (SQLite) and React (Vite) frontend. Cryptographic logic is isolated into provider classes. Benchmarks use synthetic in-memory data.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy, Pydantic, cryptography, React, TypeScript, Tailwind CSS, Recharts.

---

### Task 1: Project Skeleton & Backend Health Check

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**
```text
__pycache__/
*.py[cod]
*$py.class
.venv
venv/
ENV/
.env
data/
node_modules/
dist/
```

- [ ] **Step 2: Create requirements.txt**
```text
fastapi
uvicorn[standard]
sqlalchemy
pydantic
pydantic-settings
python-multipart
cryptography
pytest
httpx
```

- [ ] **Step 3: Create app/config.py**
```python
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "VietHeritage-QSafe"
    UPLOAD_DIR: str = "data/uploads"
    DATABASE_URL: str = "sqlite:///./data/vietheritage.db"
    
    class Config:
        env_file = ".env"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs("data", exist_ok=True)
```

- [ ] **Step 4: Create app/main.py with Health Check**
```python
from fastapi import FastAPI
from app.config import settings

app = FastAPI(title=settings.APP_NAME)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "pqc_backend": "Mock-PQ-Demo",
        "version": "0.1.0"
    }
```

- [ ] **Step 5: Run health check test**
Run: `uvicorn app.main:app --host 0.0.0.0 --port 8000 & sleep 2 && curl http://localhost:8000/api/health`
Expected: `{"status":"ok",...}`

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "feat: project skeleton and health check"
```

---

### Task 2: Database Models & Schema

**Files:**
- Create: `backend/app/db.py`
- Create: `backend/app/models.py`

- [ ] **Step 1: Create app/db.py**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: Create app/models.py**
```python
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from .db import Base

class HeritageAsset(Base):
    __tablename__ = "heritage_assets"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    category = Column(String)
    heritage_type = Column(String)
    location = Column(String)
    description = Column(Text)
    source = Column(String)
    stored_filename = Column(String)
    original_filename = Column(String)
    file_size_bytes = Column(Integer)
    mime_type = Column(String)
    sha256 = Column(String)
    sha3_256 = Column(String)
    metadata_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = Column(String, ForeignKey("heritage_assets.id"))
    signature_algorithm = Column(String)
    signature_b64 = Column(Text)
    public_key_b64 = Column(Text)
    public_key_fingerprint = Column(String)
    manifest_json = Column(Text)
    signature_size_bytes = Column(Integer)
    verification_status = Column(String)
    signed_at = Column(DateTime, default=datetime.utcnow)

class BenchmarkResult(Base):
    __tablename__ = "benchmark_results"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_name = Column(String)
    algorithm = Column(String)
    iterations = Column(Integer)
    asset_size_bytes = Column(Integer)
    cert_payload_size_bytes = Column(Integer)
    keygen_ms_avg = Column(Float)
    hash_ms_avg = Column(Float)
    sign_ms_avg = Column(Float)
    verify_ms_avg = Column(Float)
    pubkey_bytes = Column(Integer)
    sig_bytes = Column(Integer)
    cert_bytes = Column(Integer)
    overhead_percent = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Step 3: Initialize DB in main.py**
Add to `app/main.py`:
```python
from .db import engine, Base
Base.metadata.create_all(bind=engine)
```

- [ ] **Step 4: Commit**
```bash
git add backend/app/db.py backend/app/models.py backend/app/main.py
git commit -m "feat: database models and initialization"
```

---

### Task 3: Cryptographic Services (Hashing & Canonical JSON)

**Files:**
- Create: `backend/app/services/hash_service.py`
- Create: `backend/app/services/canonical_service.py`
- Test: `backend/tests/test_crypto_utils.py`

- [ ] **Step 1: Create hash_service.py**
```python
import hashlib

def compute_hashes(data: bytes):
    sha256 = hashlib.sha256(data).hexdigest()
    sha3_256 = hashlib.sha3_256(data).hexdigest()
    return sha256, sha3_256

def compute_metadata_hash(metadata: dict):
    # Hash of canonical metadata JSON
    from .canonical_service import to_canonical_json
    canonical_bytes = to_canonical_json(metadata)
    return hashlib.sha256(canonical_bytes).hexdigest()
```

- [ ] **Step 2: Create canonical_service.py**
```python
import json

def to_canonical_json(data: dict) -> bytes:
    # Sort keys, no whitespace, UTF-8
    return json.dumps(
        data, 
        sort_keys=True, 
        separators=(',', ':'), 
        ensure_ascii=False
    ).encode('utf-8')
```

- [ ] **Step 3: Write tests for crypto utils**
```python
from app.services.hash_service import compute_hashes
from app.services.canonical_service import to_canonical_json

def test_hash_stability():
    data = b"VietHeritage"
    h1, s1 = compute_hashes(data)
    h2, s2 = compute_hashes(data)
    assert h1 == h2
    assert s1 == s2

def test_canonical_json():
    d1 = {"b": 2, "a": 1}
    d2 = {"a": 1, "b": 2}
    assert to_canonical_json(d1) == to_canonical_json(d2)
```

- [ ] **Step 4: Run tests**
Run: `pytest backend/tests/test_crypto_utils.py`

- [ ] **Step 5: Commit**
```bash
git add backend/app/services/ backend/tests/
git commit -m "feat: hashing and canonical JSON services"
```

---

### Task 4: Signature Providers (RSA-PSS & Mock-PQ)

**Files:**
- Create: `backend/app/services/signature_base.py`
- Create: `backend/app/services/rsa_provider.py`
- Create: `backend/app/services/mock_pq_provider.py`
- Test: `backend/tests/test_signature_providers.py`

- [ ] **Step 1: Create signature_base.py (Interface)**
```python
from abc import ABC, abstractmethod

class SignatureProvider(ABC):
    @abstractmethod
    def generate_keypair(self): pass
    
    @abstractmethod
    def sign(self, private_key, message: bytes) -> bytes: pass
    
    @abstractmethod
    def verify(self, public_key, message: bytes, signature: bytes) -> bool: pass
    
    @abstractmethod
    def get_algorithm_name(self) -> str: pass
```

- [ ] **Step 2: Create rsa_provider.py**
```python
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
from .signature_base import SignatureProvider

class RSAPSSProvider(SignatureProvider):
    def get_algorithm_name(self): return "RSA-PSS-3072"
    
    def generate_keypair(self):
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
        public_key = private_key.public_key()
        return private_key, public_key
        
    def sign(self, private_key, message: bytes) -> bytes:
        return private_key.sign(
            message,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        
    def verify(self, public_key, message: bytes, signature: bytes) -> bool:
        try:
            public_key.verify(
                signature,
                message,
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256()
            )
            return True
        except Exception:
            return False
            
    def export_public_key(self, public_key):
        return public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
```

- [ ] **Step 3: Create mock_pq_provider.py**
```python
import os
import time
import base64
from .signature_base import SignatureProvider

class MockPQProvider(SignatureProvider):
    def get_algorithm_name(self): return "Mock-ML-DSA-65"
    
    def generate_keypair(self):
        # Simulate ML-DSA-65 key sizes (approx 1952 public, 4000 private)
        return os.urandom(4000), os.urandom(1952)
        
    def sign(self, private_key, message: bytes) -> bytes:
        # Simulate ML-DSA-65 signing time (approx 1-5ms) and size (3309 bytes)
        time.sleep(0.002) 
        return os.urandom(3309)
        
    def verify(self, public_key, message: bytes, signature: bytes) -> bool:
        # Simulate verification time
        time.sleep(0.001)
        return True # Always valid for mock
```

- [ ] **Step 4: Write tests for providers**
```python
from app.services.rsa_provider import RSAPSSProvider

def test_rsa_flow():
    provider = RSAPSSProvider()
    priv, pub = provider.generate_keypair()
    msg = b"Hello Heritage"
    sig = provider.sign(priv, msg)
    assert provider.verify(pub, msg, sig) is True
    assert provider.verify(pub, b"Tampered", sig) is False
```

- [ ] **Step 5: Commit**
```bash
git add backend/app/services/ backend/tests/
git commit -m "feat: RSA and Mock-PQ signature providers"
```

---

### Task 5: Asset Upload & Certification API

**Files:**
- Create: `backend/app/schemas.py`
- Create: `backend/app/routers/assets.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create schemas.py**
```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AssetBase(BaseModel):
    title: str
    category: str
    heritage_type: str
    location: str
    description: str
    source: str

class AssetCreate(AssetBase):
    signer_algorithm: str = "RSA-PSS-3072"

class AssetResponse(AssetBase):
    id: str
    sha256: str
    created_at: datetime
    class Config: from_attributes = True
```

- [ ] **Step 2: Create routers/assets.py**
Implement `POST /api/assets` with multipart upload.
1. Save file.
2. Hash file.
3. Hash metadata.
4. Sign manifest.
5. Save to DB.

- [ ] **Step 3: Register router in main.py**
```python
from app.routers import assets
app.include_router(assets.router, prefix="/api")
```

- [ ] **Step 4: Commit**
```bash
git add backend/app/schemas.py backend/app/routers/ backend/app/main.py
git commit -m "feat: asset upload and certification API"
```

---

### Task 6: Benchmark Logic & Dashboard API

**Files:**
- Create: `backend/app/services/benchmark_service.py`
- Create: `backend/app/routers/benchmarks.py`

- [ ] **Step 1: Create benchmark_service.py**
Implement logic for Small and Medium profiles using synthetic bytes.
Measure Keygen, Hash, Sign, Verify times.

- [ ] **Step 2: Create routers/benchmarks.py**
`POST /api/benchmarks/run`
`GET /api/benchmarks`

- [ ] **Step 3: Commit**
```bash
git add backend/app/services/benchmark_service.py backend/app/routers/benchmarks.py
git commit -m "feat: benchmark service and API"
```

---

### Task 7: Frontend Initialization (MVP Pages)

**Files:**
- Create: `frontend/` (Vite + React + TS)
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/pages/Dashboard.tsx`
- Create: `frontend/src/pages/UploadAsset.tsx`
- Create: `frontend/src/pages/AssetDetail.tsx`
- Create: `frontend/src/pages/BenchmarkDashboard.tsx`

- [ ] **Step 1: Initialize Frontend**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios lucide-react recharts clsx tailwind-merge
```

- [ ] **Step 2: Setup Tailwind & shadcn (minimal manual setup)**

- [ ] **Step 3: Implement Dashboard & Upload Pages**

- [ ] **Step 4: Implement Asset Detail with Live Tamper Demo**

- [ ] **Step 5: Implement Benchmark Dashboard with Charts**

---

### Task 8: Final Polish & Demo Seeding

**Files:**
- Create: `backend/app/seed.py`

- [ ] **Step 1: Create seed.py**
Add 3-5 sample heritage assets.

- [ ] **Step 2: Final Verification**
Run all tests.
Check UI responsiveness.
Verify RSA vs PQ metrics on charts.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: frontend MVP and demo seeding"
```
