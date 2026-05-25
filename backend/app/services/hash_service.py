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
