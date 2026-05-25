import json

def to_canonical_json(data: dict) -> bytes:
    # Sort keys, no whitespace, UTF-8
    return json.dumps(
        data, 
        sort_keys=True, 
        separators=(',', ':'), 
        ensure_ascii=False
    ).encode('utf-8')
