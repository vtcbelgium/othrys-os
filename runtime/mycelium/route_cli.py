import json
import sys

from node import select_node

raw = json.load(sys.stdin)
selected = select_node(raw["envelopes"], raw["capability"], raw.get("request", {}))
if selected is None:
    print(json.dumps({"ok": False, "reason": "NO_FEASIBLE_NODE"}, separators=(",", ":")))
    raise SystemExit(2)
print(json.dumps({"ok": True, "node_id": selected["node_id"], "selected": selected}, separators=(",", ":")))
