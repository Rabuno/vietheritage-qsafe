import json
import datetime

def to_canonical_json(data: dict) -> bytes:
    """
    Convert a dictionary to a canonical JSON byte string.
    - Sorts keys.
    - Removes whitespace.
    - Handles datetime/date objects as ISO-8601 strings.
    - Encodes as UTF-8.
    """
    def default_handler(obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")
    
    return json.dumps(
        data, 
        sort_keys=True, 
        separators=(',', ':'), 
        ensure_ascii=False,
        default=default_handler
    ).encode('utf-8')
