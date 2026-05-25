import os
import uuid
import shutil
import base64
import hashlib
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models, schemas
from ..config import settings
from ..services import hash_service, canonical_service, rsa_provider, mock_pq_provider

router = APIRouter(tags=["Assets"])

@router.get("/assets", response_model=List[schemas.AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    return db.query(models.HeritageAsset).all()

@router.get("/assets/{asset_id}", response_model=schemas.AssetResponse)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(models.HeritageAsset).filter(models.HeritageAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/assets", response_model=schemas.AssetResponse)
async def upload_asset(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    heritage_type: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    source: str = Form(...),
    signer_algorithm: str = Form("RSA-PSS-3072"),
    db: Session = Depends(get_db)
):
    # 1. Save file with UUID
    file_id = str(uuid.uuid4())
    extension = os.path.splitext(file.filename)[1]
    stored_filename = f"{file_id}{extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Save to disk
    with open(file_path, "wb") as f:
        f.write(content)
        
    # 2. Compute hashes
    sha256, sha3_256 = hash_service.compute_hashes(content)
    
    # 3. Compute metadata hash
    metadata = {
        "title": title,
        "category": category,
        "heritage_type": heritage_type,
        "location": location,
        "description": description,
        "source": source
    }
    metadata_hash = hash_service.compute_metadata_hash(metadata)
    
    # 4. Create heritage asset record
    asset = models.HeritageAsset(
        id=file_id,
        title=title,
        category=category,
        heritage_type=heritage_type,
        location=location,
        description=description,
        source=source,
        stored_filename=stored_filename,
        original_filename=file.filename,
        file_size_bytes=file_size,
        mime_type=file.content_type,
        sha256=sha256,
        sha3_256=sha3_256,
        metadata_hash=metadata_hash
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    
    # 5. Create canonical manifest JSON
    manifest = {
        "asset_id": asset.id,
        "file_sha256": sha256,
        "file_sha3_256": sha3_256,
        "metadata_hash": metadata_hash,
        "timestamp": asset.created_at.isoformat()
    }
    manifest_bytes = canonical_service.to_canonical_json(manifest)
    
    # 6. Sign manifest
    if signer_algorithm == "RSA-PSS-3072":
        provider = rsa_provider.RSAPSSSignatureProvider()
    elif "ML-DSA" in signer_algorithm or "PQ" in signer_algorithm:
        provider = mock_pq_provider.MockPQSignatureProvider()
    else:
        # Fallback to RSA
        provider = rsa_provider.RSAPSSSignatureProvider()
        
    private_key, public_key = provider.generate_keypair()
    signature = provider.sign(private_key, manifest_bytes)
    pubkey_bytes = provider.public_key_to_bytes(public_key)
    
    # Compute pubkey fingerprint
    pubkey_fingerprint = hashlib.sha256(pubkey_bytes).hexdigest()
    
    # 7. Create certificate record
    certificate = models.Certificate(
        asset_id=asset.id,
        signature_algorithm=provider.name(),
        signature_b64=base64.b64encode(signature).decode('utf-8'),
        public_key_b64=base64.b64encode(pubkey_bytes).decode('utf-8'),
        public_key_fingerprint=pubkey_fingerprint,
        manifest_json=manifest_bytes.decode('utf-8'),
        signature_size_bytes=len(signature),
        verification_status="VALID" # Initial status
    )
    db.add(certificate)
    db.commit()
    
    return asset

@router.post("/verify/manifest", response_model=schemas.VerificationResponse)
def verify_manifest(request: schemas.ManifestVerifyRequest, db: Session = Depends(get_db)):
    # 1. Find latest certificate for asset
    cert = db.query(models.Certificate)\
        .filter(models.Certificate.asset_id == request.asset_id)\
        .order_by(models.Certificate.signed_at.desc())\
        .first()
        
    if not cert:
        return schemas.VerificationResponse(valid=False, message="No certificate found for this asset")
        
    # 2. Re-canonicalize the provided manifest_json
    try:
        manifest_data = json.loads(request.manifest_json)
        canonical_manifest = canonical_service.to_canonical_json(manifest_data)
    except Exception as e:
        return schemas.VerificationResponse(valid=False, message=f"Invalid JSON format: {str(e)}")
        
    # 3. Setup provider
    if cert.signature_algorithm == "RSA-PSS-3072":
        provider = rsa_provider.RSAPSSSignatureProvider()
    elif "ML-DSA" in cert.signature_algorithm or "Mock" in cert.signature_algorithm:
        provider = mock_pq_provider.MockPQSignatureProvider()
    else:
        provider = rsa_provider.RSAPSSSignatureProvider()
        
    # 4. Decode pubkey and signature
    try:
        pubkey_bytes = base64.b64encode(base64.b64decode(cert.public_key_b64)) # Keep as bytes
        # Wait, provider expects public_key object or bytes depending on provider.
        # RSA provider expects a public_key object from PEM bytes.
        # Mock provider expects raw bytes.
        
        signature = base64.b64decode(cert.signature_b64)
        
        if cert.signature_algorithm == "RSA-PSS-3072":
            from cryptography.hazmat.primitives import serialization
            public_key = serialization.load_pem_public_key(base64.b64decode(cert.public_key_b64))
        else:
            public_key = base64.b64decode(cert.public_key_b64)
            
        # 5. Verify
        is_valid = provider.verify(public_key, canonical_manifest, signature)
        
        if is_valid:
            return schemas.VerificationResponse(valid=True, message="Signature verification successful")
        else:
            return schemas.VerificationResponse(valid=False, message="Signature verification failed (Tampered data or invalid key)")
            
    except Exception as e:
        return schemas.VerificationResponse(valid=False, message=f"Verification error: {str(e)}")
