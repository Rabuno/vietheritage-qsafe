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

class CertificateResponse(BaseModel):
    id: str
    signature_algorithm: str
    signature_b64: str
    public_key_b64: str
    public_key_fingerprint: str
    manifest_json: str
    signature_size_bytes: int
    verification_status: str
    signed_at: datetime

    class Config:
        from_attributes = True

class AssetResponse(AssetBase):
    id: str
    sha256: str
    sha3_256: str
    metadata_hash: str
    file_size_bytes: int
    mime_type: str
    created_at: datetime
    certificates: List[CertificateResponse] = []
    
    class Config:
        from_attributes = True

class BenchmarkRequest(BaseModel):
    runs_small: int = 10
    runs_medium: int = 5

class BenchmarkResponse(BaseModel):
    id: str
    profile_name: str
    algorithm: str
    iterations: int
    asset_size_bytes: int
    cert_payload_size_bytes: int
    keygen_ms_avg: float
    hash_ms_avg: float
    sign_ms_avg: float
    verify_ms_avg: float
    pubkey_bytes: int
    sig_bytes: int
    cert_bytes: int
    overhead_percent: float
    created_at: datetime

    class Config:
        from_attributes = True

class ManifestVerifyRequest(BaseModel):
    asset_id: str
    manifest_json: str

class VerificationResponse(BaseModel):
    valid: bool
    message: str
