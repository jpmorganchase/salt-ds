from datetime import datetime, timezone
import hashlib
import json


def digest(value) -> str:
    """Stable SHA-256 of any JSON-serialisable value, used to pin prompts, suites and profiles in logs."""
    data = json.dumps(value, sort_keys=True, ensure_ascii=False).encode()
    return hashlib.sha256(data).hexdigest()


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()
