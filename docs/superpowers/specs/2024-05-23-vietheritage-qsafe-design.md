# VietHeritage-QSafe Design Specification (MVP Scope)

## 1. Project Overview
**VietHeritage-QSafe** is a research prototype for preserving Vietnamese cultural heritage digital assets. It compares classical signatures (RSA-PSS) with Post-Quantum signature workflows (Mock-PQ) to evaluate the "practical costs" of migration on a standard laptop.

## 2. Technical Stack
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite, `cryptography` library.
- **Frontend**: React (TypeScript), Vite, Tailwind CSS, shadcn/ui, Recharts.
- **Storage**: `data/vietheritage.db` (SQLite) and `data/uploads/` (Local files).

## 3. Core Subsystems

### 3.1. Cryptographic Service (MVP)
- **Hashing**: SHA-256 and SHA3-256 over asset bytes.
- **Canonicalization**: Deterministic JSON manifest signing.
- **Signature Providers**:
    - `RSAPSSProvider`: 3072-bit RSA, PSS padding, SHA-256. (Mandatory)
    - `MockPQProvider`: Simulates PQC signature/key sizes and timing for workflow demo. (Mandatory fallback)
    - `MLDSAProvider`: Optional, only if `dilithium-py` installation is trivial.
- **UI Warning**: If Mock-PQ is used, display: "Mock-PQ-Demo is for workflow demonstration only and is not production-secure."

### 3.2. Heritage Asset Management
- **Upload**: 20MB limit, UUID renaming, store in `data/uploads`.
- **Manifest**: Signs a JSON containing `asset_hash`, `metadata_hash`, algorithm, timestamp, etc. (Never sign raw large files).

### 3.3. Benchmark Engine (MVP)
Uses synthetic in-memory data for measurement:
1. **Small**: 100KB asset hash, 2KB cert payload, 10-20 iterations.
2. **Medium (Default)**: 2MB asset hash, 8KB cert payload, 5-10 iterations.

**Metrics**: Hashing time, Signing time, Verification time, Key/Signature sizes, Overhead.

### 3.4. UI Pages (MVP)
- **Dashboard**: Overview and stats.
- **Upload & Sign**: Metadata form and file upload.
- **Asset Detail**: Metadata view and cryptographic info.
- **Live Tamper Demo**: Interactive manifest editing to trigger verification failure.
- **Benchmark Dashboard**: Performance charts and comparison.

## 4. Database Schema (MVP)

### `heritage_assets`
- `id` (UUID), `title`, `category`, `heritage_type`, `location`, `description`, `source`, `stored_filename`, `original_filename`, `file_size_bytes`, `mime_type`, `sha256`, `sha3_256`, `metadata_hash`, `created_at`

### `certificates`
- `id` (UUID), `asset_id`, `signature_algorithm`, `signature_b64`, `public_key_b64`, `public_key_fingerprint`, `manifest_json`, `signature_size_bytes`, `verification_status`, `signed_at`

### `benchmark_results`
- `id`, `profile_name`, `algorithm`, `iterations`, `asset_size_bytes`, `cert_payload_size_bytes`, `keygen_ms_avg`, `hash_ms_avg`, `sign_ms_avg`, `verify_ms_avg`, `pubkey_bytes`, `sig_bytes`, `cert_bytes`, `overhead_percent`, `created_at`

## 5. Deferred Features (Post-MVP)
- QR Code generation.
- Public Verification page (`/verify/{id}`).
- CSV/PDF Export.
- Large/XL Benchmark profiles.
- Advanced Verification Trace.

## 6. Implementation Priority
1. Backend health check.
2. Asset upload + hash.
3. RSA-PSS cert generation/verification.
4. Mock-PQ cert generation/verification.
5. Live Tamper verification.
6. Small/Medium benchmark logic.
7. Frontend pages.
8. UI polish.
