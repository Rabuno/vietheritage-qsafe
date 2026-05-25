# instruction.md — Build VietHeritage-QSafe Demo

## 0. Role and Goal
You are Gemini CLI acting as a senior full-stack engineer, security-aware software architect, and research prototype builder.

Build a working demo product named **VietHeritage-QSafe**.

The product is a **Quantum-Safe Digital Heritage Archive**: a web application for uploading, preserving, signing, verifying, and benchmarking Vietnamese cultural heritage digital assets using both classical and post-quantum digital signatures.

The app must be suitable for a university scientific research paper demo. Prioritize correctness, explainability, reproducibility, and clean UI over production-scale complexity.

---

## 1. Research Context
The research topic is:

> A Quantum-Safe Digital Preservation Framework for Vietnamese Cultural Heritage Assets

Vietnamese title:

> Khung lưu trữ và xác thực di sản văn hóa số Việt Nam an toàn trước rủi ro máy tính lượng tử

The system demonstrates the following idea:

Digital heritage assets such as images, audio recordings, scanned documents, 3D files, and metadata need long-term authenticity and integrity. Classical public-key signatures such as RSA/ECDSA may be threatened by future large-scale quantum computers. Therefore, a preservation system should evaluate and prototype migration to post-quantum signatures such as ML-DSA or SLH-DSA.

The demo must not claim production security. It is a research prototype for measurement and demonstration.

---

## 2. Core Research Question
Implement the application so that it supports this research question:

> What are the practical costs of applying post-quantum digital signatures to Vietnamese digital heritage preservation compared with classical digital signatures?

The system must collect data for these measurable metrics:

1. Key generation time.
2. Signing time.
3. Verification time.
4. Public key size.
5. Private key size.
6. Signature size.
7. Certificate JSON size.
8. Storage overhead ratio.
9. Tamper detection result.
10. Success/failure status for verification.

---

## 3. MVP Scope
Build an MVP with these major features:

### 3.1 Asset Management
Users can create a digital heritage asset with:

- Asset title.
- Heritage category: `TANGIBLE`, `INTANGIBLE`, `DOCUMENTARY`, `NATURAL`, `MIXED`.
- Heritage type: image, audio, video, scanned document, 3D scan, text metadata.
- Location/province.
- Cultural period or estimated date.
- Description.
- Source/owner/collector.
- Digitization date.
- License note.
- Optional tags.
- Uploaded file.

Supported file types for demo:

- Images: `.jpg`, `.jpeg`, `.png`, `.webp`.
- Documents: `.pdf`, `.txt`, `.md`, `.json`.
- Audio: `.mp3`, `.wav`.
- 3D/sample data: `.obj`, `.glb`, `.gltf`.

Reject all other file extensions.

Apply basic upload security:

- Allowlist extensions.
- Limit file size to 20 MB.
- Rename stored files using UUID, not user-provided filename.
- Store files outside public frontend assets.
- Save original filename only as metadata.
- Compute SHA-256 and SHA3-256 hashes immediately after upload.

### 3.2 Cryptographic Signing
For each uploaded asset, the system must create a canonical signing payload.

The canonical signing payload must include:

- Asset ID.
- File SHA-256 hash.
- File SHA3-256 hash.
- Metadata hash.
- Created timestamp.
- Signature algorithm name.
- Signer identity.
- Certificate version.

Use deterministic canonical JSON before signing:

- Sort keys.
- UTF-8 encoding.
- No whitespace variance.

Implement at least two signature families:

1. Classical signature baseline:
   - RSA-PSS with SHA-256, 3072-bit RSA key.
   - Use Python `cryptography` library.

2. Post-quantum signature:
   - Preferred: ML-DSA-44 or ML-DSA-65 if available through a working Python PQC package.
   - Acceptable fallback for demo: educational `dilithium-py` implementation of ML-DSA, with explicit warning in UI and README that it is not for production security.
   - If ML-DSA package installation fails, implement a clearly marked `PQ_DEMO_MOCK` mode that simulates signature size/time using generated random bytes, but only as a last fallback. The UI must clearly display `Mock mode — not a cryptographic signature`.

Do not silently fall back to mock mode. Always expose the active backend in UI and API.

### 3.3 Certificate Generation
For each asset, generate a certificate record containing:

- Certificate ID.
- Asset ID.
- Asset title.
- File name.
- File MIME/type.
- File size.
- SHA-256.
- SHA3-256.
- Metadata hash.
- Signer name.
- Signature algorithm.
- Signature backend.
- Signature value, base64.
- Public key, base64 or PEM.
- Created timestamp.
- Verification URL.
- QR code image path or base64.
- Certificate JSON canonical hash.

The certificate must be exportable as:

1. JSON.
2. Simple HTML certificate page.
3. Optional PDF if easy; do not block MVP on PDF.

### 3.4 Public Verification
Create a public verification page:

`/verify/{certificate_id}`

The page must show:

- Asset title.
- Metadata summary.
- Certificate status.
- Hash status.
- Signature status.
- Algorithm used.
- Signature size.
- Public key size.
- Verification timestamp.

Allow the user to upload a file to check whether it matches the certificate:

- If uploaded file hash equals stored hash and signature verifies, show `VALID`.
- If uploaded file hash differs, show `TAMPERED_FILE`.
- If metadata changed, show `METADATA_MISMATCH`.
- If signature invalid, show `INVALID_SIGNATURE`.

Add a tamper-demo button:

- The button should create a temporary modified version of the canonical payload or file hash and show that verification fails.
- This is for demo presentation.

### 3.5 Benchmark Dashboard
Create a dashboard for comparing classical and post-quantum signatures.

Benchmark inputs:

- Algorithm: RSA-PSS, ML-DSA-44, ML-DSA-65 if available.
- Number of runs: 1, 5, 10.
- Payload type: small metadata only, medium image hash payload, large simulated metadata payload.

Benchmark outputs:

- Key generation time in milliseconds.
- Signing time in milliseconds.
- Verification time in milliseconds.
- Public key size in bytes.
- Private key size in bytes.
- Signature size in bytes.
- Certificate size in bytes.
- Storage overhead percentage.

Show charts:

- Bar chart: signature size comparison.
- Bar chart: signing time comparison.
- Bar chart: verification time comparison.
- Table of benchmark results.

Allow exporting benchmark results as CSV and JSON.

### 3.6 Demo Seed Data
Create seed data for at least 8 Vietnamese heritage sample records. Use placeholder/sample files generated by the project, not copyrighted real media.

Example records:

1. Tranh Đông Hồ — Đám cưới chuột sample.
2. Nhã nhạc cung đình Huế audio metadata sample.
3. Hoàng thành Thăng Long scanned document sample.
4. Phố cổ Hội An image metadata sample.
5. Thánh địa Mỹ Sơn architectural pattern sample.
6. Trống đồng Đông Sơn pattern sample.
7. Dân ca quan họ Bắc Ninh audio metadata sample.
8. Mộc bản triều Nguyễn document metadata sample.

Use generated placeholder files such as text files, simple SVG/PNG placeholders, or JSON metadata. Do not download external copyrighted data.

---

## 4. Recommended Tech Stack
Use this stack unless there is a strong reason not to:

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- SQLite for local demo
- Pydantic
- Uvicorn
- python-multipart
- cryptography
- qrcode
- pillow
- pandas for benchmark export
- pytest

### Frontend
- React + Vite + TypeScript
- Tailwind CSS
- shadcn/ui if available
- Recharts for charts
- Axios or fetch API

### Storage
- SQLite database file: `data/vietheritage.db`
- Uploaded files: `data/uploads/`
- Certificates: stored in DB and exportable to `data/certificates/`

### Optional PQC Packages
Try in this order:

1. `oqs` / `liboqs-python` if installable.
2. `dilithium-py` for educational ML-DSA demo.
3. `PQ_DEMO_MOCK` fallback only when real PQ backend is unavailable.

Design the code using a signature provider interface so the backend can switch implementations without changing the API.

---

## 5. Required Repository Structure
Create this structure:

```text
vietheritage-qsafe/
├── README.md
├── docker-compose.yml
├── .gitignore
├── .env.example
├── backend/
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   ├── routers/
│   │   │   ├── assets.py
│   │   │   ├── certificates.py
│   │   │   ├── verify.py
│   │   │   └── benchmarks.py
│   │   ├── services/
│   │   │   ├── file_service.py
│   │   │   ├── hash_service.py
│   │   │   ├── canonical_json.py
│   │   │   ├── signature_base.py
│   │   │   ├── rsa_signature.py
│   │   │   ├── pq_signature.py
│   │   │   ├── certificate_service.py
│   │   │   ├── qr_service.py
│   │   │   └── benchmark_service.py
│   │   └── utils/
│   │       └── timeit.py
│   └── tests/
│       ├── test_hash_service.py
│       ├── test_canonical_json.py
│       ├── test_rsa_signature.py
│       ├── test_certificate_verification.py
│       └── test_tamper_detection.py
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/client.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── UploadAsset.tsx
│   │   │   ├── AssetDetail.tsx
│   │   │   ├── VerifyPage.tsx
│   │   │   ├── BenchmarkPage.tsx
│   │   │   └── AboutResearch.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── CertificatePanel.tsx
│   │   │   ├── QRCodePanel.tsx
│   │   │   └── BenchmarkCharts.tsx
│   │   └── styles.css
└── docs/
    ├── research-methodology.md
    ├── demo-script.md
    ├── api-contract.md
    └── limitations.md
```

---

## 6. Database Schema
Use SQLAlchemy models with these tables.

### 6.1 `heritage_assets`
Fields:

- `id`: UUID string primary key.
- `title`: string.
- `category`: string enum.
- `heritage_type`: string.
- `location`: string.
- `period`: string nullable.
- `description`: text.
- `source`: string.
- `digitization_date`: date nullable.
- `license_note`: string nullable.
- `tags_json`: text JSON array.
- `original_filename`: string.
- `stored_filename`: string.
- `mime_type`: string.
- `file_size`: integer.
- `sha256`: string.
- `sha3_256`: string.
- `metadata_hash`: string.
- `created_at`: datetime.
- `updated_at`: datetime.

### 6.2 `certificates`
Fields:

- `id`: UUID string primary key.
- `asset_id`: foreign key.
- `certificate_version`: string default `v1`.
- `signature_algorithm`: string.
- `signature_backend`: string.
- `signer_name`: string.
- `canonical_payload_json`: text.
- `signature_b64`: text.
- `public_key_b64`: text nullable.
- `public_key_pem`: text nullable.
- `certificate_hash`: string.
- `qr_code_path`: string nullable.
- `created_at`: datetime.

### 6.3 `benchmark_results`
Fields:

- `id`: UUID string primary key.
- `algorithm`: string.
- `backend`: string.
- `payload_size`: integer.
- `keygen_ms`: float.
- `sign_ms`: float.
- `verify_ms`: float.
- `public_key_bytes`: integer.
- `private_key_bytes`: integer.
- `signature_bytes`: integer.
- `certificate_bytes`: integer.
- `storage_overhead_percent`: float.
- `valid`: boolean.
- `created_at`: datetime.

---

## 7. Backend API Contract
Implement these endpoints.

### Health
`GET /api/health`

Response:

```json
{
  "status": "ok",
  "app": "VietHeritage-QSafe",
  "pqc_backend": "ML-DSA-44 via dilithium-py | OQS | PQ_DEMO_MOCK",
  "version": "0.1.0"
}
```

### Assets
`GET /api/assets`

Return list of assets with latest certificate status.

`POST /api/assets`

Multipart form fields:

- file
- title
- category
- heritage_type
- location
- period
- description
- source
- digitization_date
- license_note
- tags
- signer_name
- signature_algorithm: `RSA-PSS` or `ML-DSA-44` or `ML-DSA-65`

Behavior:

1. Validate file.
2. Store file with UUID name.
3. Compute hashes.
4. Compute metadata hash.
5. Save asset.
6. Generate signing payload.
7. Sign payload.
8. Create certificate.
9. Generate QR code.
10. Return asset + certificate.

`GET /api/assets/{asset_id}`

Return asset detail and certificates.

### Certificates
`GET /api/certificates/{certificate_id}`

Return certificate data, excluding private key.

`GET /api/certificates/{certificate_id}/json`

Download/export certificate JSON.

`GET /api/certificates/{certificate_id}/html`

Render simple certificate HTML.

### Verification
`GET /api/verify/{certificate_id}`

Verify certificate against stored asset and return status.

`POST /api/verify/{certificate_id}/file`

Upload a file and compare it against the certificate hash. Return status.

`POST /api/verify/{certificate_id}/tamper-demo`

Run tamper demonstration and return expected invalid result.

### Benchmarks
`POST /api/benchmarks/run`

Request:

```json
{
  "algorithms": ["RSA-PSS", "ML-DSA-44"],
  "runs": 5,
  "payload_profile": "small|medium|large"
}
```

Response: benchmark summary and rows.

`GET /api/benchmarks`

Return benchmark history.

`GET /api/benchmarks/export.csv`

Return CSV.

---

## 8. UI Requirements
Create a clean academic demo UI.

### Theme
Use a Vietnamese cultural archive feel:

- Background: light parchment or neutral slate.
- Accent: deep red / bronze / indigo.
- Use clean cards, not overly decorative UI.
- Make the dashboard suitable for screenshots in a research paper.

### Pages

#### 8.1 Dashboard
Show:

- Total assets.
- Total certificates.
- Number of RSA-signed assets.
- Number of PQ-signed assets.
- Latest verification status.
- Quick action buttons: Upload Asset, Run Benchmark, View Research Methodology.

#### 8.2 Upload Asset
Form for metadata and file upload.

After upload success, show:

- Hashes.
- Signature algorithm.
- Signature size.
- Public verification link.
- QR code.
- Button to open asset detail.

#### 8.3 Asset Detail
Show:

- Metadata.
- File hash.
- Certificate panel.
- QR code.
- Verification status.
- Tamper demo button.
- Export certificate JSON button.

#### 8.4 Public Verify Page
Show a clear result:

- Green: `VALID`.
- Red: `TAMPERED` or `INVALID_SIGNATURE`.
- Yellow: `WARNING` if mock backend is active.

Allow upload of a candidate file to verify.

#### 8.5 Benchmark Page
Show:

- Run benchmark form.
- Results table.
- Charts.
- Export CSV/JSON.
- Explanation text: what each metric means for digital preservation.

#### 8.6 About Research Page
Explain:

- Why digital heritage needs integrity and authenticity.
- Why quantum computing affects classical public-key cryptography.
- What ML-DSA/SLH-DSA are at a high level.
- What the demo measures.
- Limitations.

---

## 9. Cryptographic Design Details

### 9.1 Canonical Payload
Create a function:

`make_canonical_json(data: dict) -> bytes`

Requirements:

- Sort keys.
- Use UTF-8.
- Use compact separators.
- Convert datetimes to ISO-8601 strings.
- Do not include signature inside the payload being signed.

### 9.2 Metadata Hash
Create metadata object excluding mutable fields like `updated_at`.

Hash canonical metadata JSON using SHA-256.

### 9.3 RSA-PSS Provider
Create class:

`RSAPSSSignatureProvider`

Methods:

- `name() -> str`
- `backend() -> str`
- `generate_keypair() -> KeyPair`
- `sign(private_key, message: bytes) -> bytes`
- `verify(public_key, message: bytes, signature: bytes) -> bool`
- `public_key_to_bytes()`
- `private_key_to_bytes()`

Use RSA 3072-bit, PSS padding, SHA-256.

### 9.4 PQ Signature Provider
Create class:

`PQSignatureProvider`

Support algorithm strings:

- `ML-DSA-44`
- `ML-DSA-65`

Implementation strategy:

1. Try OQS backend.
2. Try dilithium-py backend.
3. Last resort mock backend with visible warning.

Expose method:

`is_mock() -> bool`

The UI must display mock warning if mock mode is active.

### 9.5 Certificate Hash
After certificate JSON is built, compute SHA-256 over canonical certificate JSON excluding QR image data.

---

## 10. Verification Logic
Implement function:

`verify_certificate(certificate_id, optional_uploaded_file=None) -> VerificationResult`

Return statuses:

- `VALID`
- `TAMPERED_FILE`
- `METADATA_MISMATCH`
- `INVALID_SIGNATURE`
- `CERTIFICATE_NOT_FOUND`
- `ASSET_NOT_FOUND`
- `MOCK_SIGNATURE_WARNING`

Verification steps:

1. Load certificate.
2. Load asset.
3. Recompute current stored file hash.
4. Compare with certificate hash.
5. Recompute metadata hash.
6. Compare with certificate metadata hash.
7. Verify signature over canonical payload using stored public key.
8. If optional uploaded file exists, compare uploaded hash with certificate hash.
9. Return detailed result.

---

## 11. Tests Required
Write pytest tests for:

1. Hash changes when file content changes.
2. Canonical JSON is stable regardless of key order.
3. RSA signature verifies correctly.
4. RSA signature fails for tampered message.
5. Certificate verifies for original file.
6. Certificate fails after file tampering.
7. Metadata hash changes after metadata modification.
8. Benchmark service returns all required metrics.
9. File upload rejects dangerous extensions like `.php`, `.exe`, `.js`, `.html`.
10. File upload renames files using UUID.

All tests should pass with:

```bash
cd backend
pytest
```

---

## 12. Seed Script
Implement:

```bash
cd backend
python -m app.seed
```

The seed script should:

1. Initialize database.
2. Create sample placeholder files.
3. Create 8 heritage assets.
4. Generate a mix of RSA and PQ certificates.
5. Print demo login-free URLs or API endpoints.

---

## 13. README Requirements
Write a strong README with:

1. Project overview.
2. Research motivation.
3. Features.
4. Architecture diagram in text/mermaid.
5. Setup instructions.
6. How to run backend.
7. How to run frontend.
8. How to seed data.
9. How to run tests.
10. Demo script for presentation.
11. Known limitations.
12. Security disclaimer.

Add quick start:

```bash
# Backend
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## 14. Documentation Files
Create these docs.

### 14.1 `docs/research-methodology.md`
Include:

- Problem statement.
- Research question.
- Proposed framework.
- Metrics.
- Experimental setup.
- Expected results table.
- Threats to validity.
- Limitations.

### 14.2 `docs/demo-script.md`
Include a 5-minute presentation script:

1. Introduce problem.
2. Upload asset.
3. Show hash/certificate.
4. Scan/open verification page.
5. Run tamper demo.
6. Run benchmark.
7. Explain research contribution.

### 14.3 `docs/api-contract.md`
Document all API endpoints with request/response examples.

### 14.4 `docs/limitations.md`
Mention:

- Prototype only.
- Not audited cryptography.
- PQ backend may be educational or mock depending on environment.
- No real museum-grade preservation workflow yet.
- No long-term storage redundancy.
- No real identity authority/PKI.
- No legal validity for generated certificates.

---

## 15. Acceptance Criteria
The project is complete only if all criteria below are satisfied:

1. Backend starts successfully with `uvicorn app.main:app --reload --port 8000`.
2. Frontend starts successfully with `npm run dev`.
3. User can upload an asset with metadata and file.
4. System computes SHA-256 and SHA3-256 hashes.
5. System generates RSA certificate.
6. System generates PQ certificate or clearly marked mock PQ certificate.
7. Verification page can validate original asset.
8. Tamper demo visibly fails verification.
9. Benchmark page compares RSA and PQ signature metrics.
10. Seed script creates 8 sample assets.
11. Tests exist and pass.
12. README explains setup and limitations.
13. UI clearly shows the active PQ backend.
14. No private key is exposed through public API responses.
15. Uploaded filenames are not trusted or reused as storage filenames.

---

## 16. Development Workflow for Gemini CLI
Follow this workflow:

1. Inspect current directory.
2. Create project structure.
3. Implement backend first.
4. Implement tests for backend core services.
5. Implement seed data.
6. Implement frontend.
7. Implement docs.
8. Run tests.
9. Run lint/build if possible.
10. Print final summary with:
    - Files created.
    - Commands to run.
    - Known limitations.
    - Whether PQ backend is real or mock.

Do not stop after creating empty skeleton files. Implement actual working code.

If a dependency fails, do not delete the feature. Add a graceful fallback and document it.

If you must simplify, preserve these features in priority order:

1. Upload asset.
2. Hash asset.
3. Generate certificate.
4. RSA signing.
5. PQ signing or visible PQ mock.
6. Verify page.
7. Tamper demo.
8. Benchmark dashboard.
9. Seed data.
10. Export features.

---

## 17. Important Security Rules
Even though this is a demo, follow these rules:

1. Never expose private keys through API responses.
2. Never store uploaded file using the original filename.
3. Never trust Content-Type alone.
4. Use extension allowlist.
5. Limit file size.
6. Store uploads under `data/uploads`, not under frontend public folder.
7. Make signature payload canonical.
8. Clearly label educational or mock cryptography.
9. Use environment variables for settings.
10. Add CORS only for local frontend origin in development.

---

## 18. Suggested Research Contribution Text
Use this text in README/About page:

VietHeritage-QSafe proposes a practical framework for applying quantum-safe digital signatures to cultural heritage preservation workflows. The framework combines cryptographic hashing, canonical metadata signing, certificate generation, public verification, tamper detection, and benchmark-based migration analysis. The system is evaluated by comparing classical RSA-PSS signatures with post-quantum ML-DSA-style signatures across time cost, key size, signature size, certificate size, and verification behavior. The goal is not to prove production readiness, but to provide an experimental basis for discussing the cost of future quantum-safe migration in Vietnamese digital heritage archives.

---

## 19. Suggested Paper Structure
The final research paper can follow this structure:

1. Introduction
2. Background
   - Digital heritage preservation
   - Quantum threat to public-key cryptography
   - Post-quantum digital signatures
3. Related Work
4. Proposed Framework
5. System Design
6. Implementation
7. Experimental Setup
8. Results and Discussion
9. Threats to Validity
10. Conclusion and Future Work

---

## 20. Final Output Required from Gemini CLI
When finished, provide:

1. A concise implementation summary.
2. Exact commands to run backend and frontend.
3. Test results.
4. A list of created files.
5. A clear note on which PQC backend is active.
6. Any manual steps required.

