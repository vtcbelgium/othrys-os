import json
import sys

from colony import quarantine, route_live

raw = json.load(sys.stdin)
action = raw.get("action", "route")
if action == "quarantine":
    print(json.dumps(quarantine(raw["envelope"], raw.get("reason", "NODE_LOST")), separators=(",", ":")))
    raise SystemExit(0)
selected = route_live(raw["envelopes"], raw["capability"], raw.get("request", {}))
if selected is None:
    print(json.dumps({"ok": False, "reason": "NO_FEASIBLE_NODE"}, separators=(",", ":")))
    raise SystemExit(2)
print(json.dumps({"ok": True, "selected": selected}, separators=(",", ":")))
