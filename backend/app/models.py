import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
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

    certificates = relationship("Certificate", backref="asset", cascade="all, delete-orphan")

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
