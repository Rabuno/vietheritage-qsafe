import os
import uuid
import hashlib
import base64
import json
from datetime import datetime
from sqlalchemy.orm import Session
from .db import SessionLocal, engine, Base
from . import models
from .config import settings
from .services import hash_service, canonical_service, rsa_provider, mock_pq_provider

def seed_data():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(models.HeritageAsset).count() > 0:
        print("Database already seeded. Skipping...")
        db.close()
        return

    print("Seeding sample heritage assets...")
    
    heritage_samples = [
        {
            "title": "Tranh Đông Hồ - Đám cưới chuột",
            "category": "TANGIBLE",
            "heritage_type": "image",
            "location": "Bắc Ninh",
            "description": "Bức tranh dân gian Đông Hồ nổi tiếng mô tả cảnh đám cưới chuột.",
            "source": "Bảo tàng Mỹ thuật Việt Nam",
            "filename": "dong_ho_mouse_wedding.png",
            "content": b"Fake PNG content for Dong Ho Mouse Wedding",
            "algorithm": "RSA-PSS-3072"
        },
        {
            "title": "Nhã nhạc cung đình Huế",
            "category": "INTANGIBLE",
            "heritage_type": "audio",
            "location": "Thừa Thiên Huế",
            "description": "Âm nhạc cung đình triều Nguyễn, di sản văn hóa phi vật thể của nhân loại.",
            "source": "Trung tâm Bảo tồn Di tích Cố đô Huế",
            "filename": "nha_nhac_hue_sample.mp3",
            "content": b"Fake MP3 content for Nha Nhac Hue",
            "algorithm": "ML-DSA-44 (Mock)"
        },
        {
            "title": "Hoàng thành Thăng Long",
            "category": "TANGIBLE",
            "heritage_type": "document",
            "location": "Hà Nội",
            "description": "Bản đồ khảo cổ học khu di tích Hoàng thành Thăng Long.",
            "source": "Trung tâm Bảo tồn Di sản Thăng Long",
            "filename": "thang_long_map.pdf",
            "content": b"Fake PDF content for Thang Long Map",
            "algorithm": "RSA-PSS-3072"
        },
        {
            "title": "Phố cổ Hội An",
            "category": "TANGIBLE",
            "heritage_type": "image",
            "location": "Quảng Nam",
            "description": "Ảnh chụp từ trên cao khu phố cổ Hội An đêm rằm.",
            "source": "Sở Văn hóa Du lịch Quảng Nam",
            "filename": "hoi_an_night.jpg",
            "content": b"Fake JPG content for Hoi An Night",
            "algorithm": "ML-DSA-65 (Mock)"
        },
        {
            "title": "Thánh địa Mỹ Sơn",
            "category": "TANGIBLE",
            "heritage_type": "3D scan",
            "location": "Quảng Nam",
            "description": "Dữ liệu quét 3D tháp cổ Mỹ Sơn - Khu vực tháp B.",
            "source": "Dự án Bảo tồn Di sản Chăm",
            "filename": "my_son_tower_b.glb",
            "content": b"Fake 3D GLB content for My Son Tower B",
            "algorithm": "RSA-PSS-3072"
        },
        {
            "title": "Trống đồng Đông Sơn",
            "category": "TANGIBLE",
            "heritage_type": "3D scan",
            "location": "Thanh Hóa",
            "description": "Quét 3D trống đồng Ngọc Lũ - Di sản văn hóa Đông Sơn.",
            "source": "Bảo tàng Lịch sử Quốc gia",
            "filename": "dong_son_drum.obj",
            "content": b"Fake 3D OBJ content for Dong Son Drum",
            "algorithm": "ML-DSA-44 (Mock)"
        },
        {
            "title": "Dân ca quan họ Bắc Ninh",
            "category": "INTANGIBLE",
            "heritage_type": "audio",
            "location": "Bắc Ninh",
            "description": "Bản ghi âm bài hát quan họ 'Người ơi người ở đừng về'.",
            "source": "Viện Âm nhạc Việt Nam",
            "filename": "quan_ho_bac_ninh.wav",
            "content": b"Fake WAV content for Quan Ho Bac Ninh",
            "algorithm": "RSA-PSS-3072"
        },
        {
            "title": "Mộc bản triều Nguyễn",
            "category": "DOCUMENTARY",
            "heritage_type": "document",
            "location": "Lâm Đồng",
            "description": "Ảnh quét kỹ thuật số bản khắc gỗ triều Nguyễn về lịch sử Việt Nam.",
            "source": "Trung tâm Lưu trữ Quốc gia IV",
            "filename": "moc_ban_nguyen.json",
            "content": b"Fake JSON content for Moc Ban Nguyen",
            "algorithm": "ML-DSA-65 (Mock)"
        }
    ]

    for sample in heritage_samples:
        file_id = str(uuid.uuid4())
        extension = os.path.splitext(sample["filename"])[1]
        stored_filename = f"{file_id}{extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)
        
        # Save fake content
        with open(file_path, "wb") as f:
            f.write(sample["content"])
            
        sha256, sha3_256 = hash_service.compute_hashes(sample["content"])
        
        metadata = {
            "title": sample["title"],
            "category": sample["category"],
            "heritage_type": sample["heritage_type"],
            "location": sample["location"],
            "description": sample["description"],
            "source": sample["source"]
        }
        metadata_hash = hash_service.compute_metadata_hash(metadata)
        
        asset = models.HeritageAsset(
            id=file_id,
            title=sample["title"],
            category=sample["category"],
            heritage_type=sample["heritage_type"],
            location=sample["location"],
            description=sample["description"],
            source=sample["source"],
            stored_filename=stored_filename,
            original_filename=sample["filename"],
            file_size_bytes=len(sample["content"]),
            mime_type="application/octet-stream", # Generic
            sha256=sha256,
            sha3_256=sha3_256,
            metadata_hash=metadata_hash,
            created_at=datetime.utcnow()
        )
        db.add(asset)
        db.flush() # To get asset.id and created_at if needed
        
        # Create canonical manifest
        manifest = {
            "asset_id": asset.id,
            "file_sha256": sha256,
            "file_sha3_256": sha3_256,
            "metadata_hash": metadata_hash,
            "timestamp": asset.created_at.isoformat()
        }
        manifest_bytes = canonical_service.to_canonical_json(manifest)
        
        # Sign
        if sample["algorithm"] == "RSA-PSS-3072":
            provider = rsa_provider.RSAPSSSignatureProvider()
        else:
            provider = mock_pq_provider.MockPQSignatureProvider()
            
        private_key, public_key = provider.generate_keypair()
        signature = provider.sign(private_key, manifest_bytes)
        pubkey_bytes = provider.public_key_to_bytes(public_key)
        pubkey_fingerprint = hashlib.sha256(pubkey_bytes).hexdigest()
        
        certificate = models.Certificate(
            asset_id=asset.id,
            signature_algorithm=provider.name() if sample["algorithm"] == "RSA-PSS-3072" else sample["algorithm"],
            signature_b64=base64.b64encode(signature).decode('utf-8'),
            public_key_b64=base64.b64encode(pubkey_bytes).decode('utf-8'),
            public_key_fingerprint=pubkey_fingerprint,
            manifest_json=manifest_bytes.decode('utf-8'),
            signature_size_bytes=len(signature),
            verification_status="VALID",
            signed_at=datetime.utcnow()
        )
        db.add(certificate)
        print(f"Added asset: {sample['title']} with {sample['algorithm']}")

    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_data()
