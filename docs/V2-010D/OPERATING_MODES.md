# V2-010D — OTHRYS OS Operating Modes

OTHRYS OS now treats operating mode as enforced system policy, not a workstation preference.

## Modes
- `OBSERVE` — reads only; every intent write is denied.
- `PLAN` — planning/proposal intents only; mutation and execution are denied.
- `SUPERVISED_EXECUTE` — planning, mutation and execution requests are allowed into the existing governed chain; consequential actions remain separately operator-gated.
- `AUTONOMOUS_EXECUTE` — the same governed action classes may proceed under Trust Canal policy without requiring a UI confirmation at every step. It does not itself schedule work or grant authority.

The canonical default is `SUPERVISED_EXECUTE` so the already-proven operator-gated V2 chain continues to function without a silent autonomy upgrade.

## Enforcement
Mode enforcement occurs twice: before Command Deck persists an intent, and again inside `admitDeckIntent` immediately before Trust Canal admission. Direct inbox insertion therefore cannot bypass operating mode policy.

## Authority law
A mode decision always carries `authorityGranted:false` and `executionStarted:false`. Mode selection is an eligibility filter only. Trust Canal remains the admission authority and Talos remains the evidence authority.

## API projection
`GET /api/operating-mode` returns the active mode plus all available mode contracts. It is authenticated and read-only. No mode-changing endpoint exists in this mission.

## Proof
- Targeted policy/Deck/Trust Canal suite: 38/38 PASS.
- Full Legion runtime after integration: 200/200 PASS.
- PLAN mutation denial is proven both before intent persistence and at Trust Canal admission.
