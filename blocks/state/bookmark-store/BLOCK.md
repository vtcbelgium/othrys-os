## ID
`block.state.bookmark-store`

## VERSION
`0.1.0-training`

## MATURITY
TRAINING_CANDIDATE only. Not ADMITTED, CERTIFIED or GOLDEN.

## PURPOSE
Durable local bookmark CRUD with URL canonicalization, atomic persistence, corruption refusal and deep-cloned outputs.

## PROVENANCE
L2-007: Qwen3.5 initial stock-guided build still produced malformed/truncated stateful code. Qwen3-Coder hard repair regressed into tool/runtime leakage (`read_file`/`run_git`) and failed Talos 0/8. After governed repair paths failed, operator bounded recovery adapted the proven L2 CRUD persistence pattern. Talos then exposed one oracle mistake around lazy corruption detection; the fixture was corrected against the declared synchronous factory contract. Final Talos 8/8 PASS.

## ADMISSION
Training proof never grants authority.
