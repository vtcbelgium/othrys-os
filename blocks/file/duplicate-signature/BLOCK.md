## ID
`block.file.duplicate-signature`
## MATURITY
TRAINING_CANDIDATE only.
## PROVENANCE
L1-024: Qwen3.5 emitted syntactically invalid trailing text and then failed to mutate on repair. Qwen3-Coder repaired syntax/frozen ids but accidentally removed the named export. Operator applied only the missing export keyword after repair paths were exhausted. Final Talos 7/7. Record both repair regression and intervention debt.
