from app.services.hash_service import compute_hashes
from app.services.canonical_service import to_canonical_json

def test_hash_stability():
    data = b"VietHeritage"
    h1, s1 = compute_hashes(data)
    h2, s2 = compute_hashes(data)
    assert h1 == h2
    assert s1 == s2
    # Verify SHA-256 for "VietHeritage"
    # python -c "import hashlib; print(hashlib.sha256(b'VietHeritage').hexdigest())" -> 5fcf4a39c8bc117a6d5394d85e2ca91f441f22d7320bf38c6dd5528806b46100
    assert h1 == "5fcf4a39c8bc117a6d5394d85e2ca91f441f22d7320bf38c6dd5528806b46100"

def test_canonical_json():
    d1 = {"b": 2, "a": 1}
    d2 = {"a": 1, "b": 2}
    assert to_canonical_json(d1) == to_canonical_json(d2)
    assert to_canonical_json(d1) == b'{"a":1,"b":2}'

def test_canonical_json_with_datetime():
    import datetime
    dt = datetime.datetime(2024, 5, 23, 10, 30, 0)
    d = {"date": dt, "label": "event"}
    expected = b'{"date":"2024-05-23T10:30:00","label":"event"}'
    assert to_canonical_json(d) == expected

    date_only = datetime.date(2024, 5, 23)
    d2 = {"date": date_only}
    assert to_canonical_json(d2) == b'{"date":"2024-05-23"}'

def test_metadata_hash():
    from app.services.hash_service import compute_metadata_hash
    metadata = {"title": "Trống đồng", "category": "TANGIBLE"}
    h1 = compute_metadata_hash(metadata)
    # Recompute manually
    import hashlib
    import json
    expected_bytes = json.dumps(metadata, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    expected_hash = hashlib.sha256(expected_bytes).hexdigest()
    assert h1 == expected_hash
