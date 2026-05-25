# Service Interaction Graph

```mermaid
graph TD
    FileUpload[File Upload] --> HashService[HashService]
    Metadata[Metadata Input] --> HashService
    HashService --> CanonicalService[CanonicalService]
    HashService --> DB[(SQLite DB)]
    
    subgraph Cryptographic Services
        HashService[hash_service.py]
        CanonicalService[canonical_service.py]
    end
    
    HashService -- compute_metadata_hash --> CanonicalService
    CanonicalService -- to_canonical_json --> HashService
```

## Service Details

### CanonicalService
- Ensures deterministic JSON representation.
- Sorts keys.
- Removes whitespace.
- Uses UTF-8 encoding.

### HashService
- `compute_hashes(data)`: Returns SHA-256 and SHA3-256 for binary data.
- `compute_metadata_hash(metadata)`: Returns SHA-256 of the canonical JSON representation of the metadata.
