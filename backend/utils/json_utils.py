import json
import re

def safe_json_loads(content):
    """
    Try to load JSON strictly; if the model added extra text, extract the first JSON block.
    Supports array or object.
    """
    try:
        return json.loads(content)
    except Exception:
        pass

    # Try to extract the first JSON array or object via regex
    match = re.search(r'(\{.*\}|\[.*\])', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            return None
    return None