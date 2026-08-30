## ID
`block.generate.fixture`

## MATURITY
TRAINING_CANDIDATE only.

## PROVENANCE
L1-032: first launch failed before worker execution because PowerShell prompt transport interpreted embedded punctuation; corrected transport then Qwen3.5 reached 6/8 but used crypto instead of the requested dependency-free uint32 PRNG and returned a normal-prototype object. A bounded heavy-repair request produced code that passed Talos 8/8 and a static no-import gate, but the launcher result receipt was missing after MCP timeout. Treat that as orchestration evidence: proof exists, worker attribution/result receipt is incomplete. Never infer authority from it.
