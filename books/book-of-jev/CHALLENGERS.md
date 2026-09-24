# JEV Cortex — Open System-One Challengers

Date: **2026-09-24**  
Status: **RESEARCH ONLY — NOT QUALIFIED**

The JEV Cortex may benchmark open local decision models as challengers to hosted Jev. A challenger is not Jev, does not inherit Jev trust, and does not become a production fallback merely because it is free.

## Common OTHRYS seed

The first local comparison used the 10 synthetic Router seed cases already stored in `training/jev/benchmark-cases.json`.

Each case contains five expected decisions:

- primary task type;
- repository required;
- fresh web required;
- execution required;
- consequence/risk score.

Total scored decisions: **50**.

This is a smoke benchmark, not the serious historical OTHRYS replay set.

## Laya — local challenger

Projects:
- Python/reference: https://github.com/NandhaKishorM/laya
- Node/ONNX runtime: https://github.com/receptron/laya

Licensing:
- reference/model project: Apache-2.0;
- Node wrapper: MIT;
- published Laya model weights: Apache-2.0.

Local labs:
- `C:\Users\othry\Projects\othrys-laya-lab`
- `C:\Users\othry\Projects\othrys-laya-python`

### Node/ONNX smoke

Package: `@receptron/laya@0.1.2`

Installation:
- npm reported 0 vulnerabilities;
- `onnxruntime-node` native install script was explicitly approved rather than weakening PowerShell execution policy;
- base ONNX weights downloaded from Hugging Face.

Single OTHRYS case:
- expected task = `build`;
- actual task = `research`;
- task confidence = 0.0245;
- expected repo need = true, predicted probability = 0.3037;
- expected execution need = true, predicted probability = 0.2869;
- first cold load = 37.8 s;
- inference = 225 ms on CPU.

Attempting the Node wrapper's `typed-decisions` subfolder returned a Hugging Face 404 because that ONNX variant is not published in the wrapper repository. This is upstream packaging evidence, not an OTHRYS failure.

### Official Python typed-decisions checkpoint

Package: `laya==0.3.20`, isolated Python 3.11 venv.

The shipped package emitted a temperature warning for an out-of-range calibration entry and instructed callers to treat affected confidence as uncalibrated.

10-case OTHRYS Router seed:
- correct decisions: **29 / 50**
- accuracy: **58%**
- warm CPU cases after first load: mostly ~0.84–0.91 s each
- systematic weaknesses in this seed: repo need, execution need and risk
- several task classifications were correct, but task confidence was generally very low.

Disposition: **NOT QUALIFIED**.

## Von 1.2 — local challenger

Project: https://github.com/wfzyx/von  
License: Apache-2.0  
Package: `von-sdk==1.2.2`

Windows Python 3.12 test was abandoned because Windows Application Control blocked the uv-managed Python `_ctypes` DLL. OTHRYS did not disable or weaken Application Control.

A clean WSL Ubuntu 24.04 lab was used instead:

- lab: `/home/othrys/othrys-von-lab`
- Python: 3.12.3
- Torch: 2.14.0+cu130
- CUDA: enabled
- GPU: NVIDIA GeForce RTX 5070 Laptop GPU
- weights: Von 1.2.0 from Hugging Face

Single OTHRYS smoke case:
- expected task = `build`;
- actual task = `research`;
- expected repo need = true, predicted probability = 0.3285;
- expected execution need = true, predicted probability = 0.663;
- model cold initialization dominated the first run.

10-case OTHRYS Router seed:
- correct decisions: **31 / 50**
- accuracy: **62%**
- first case including initialization = ~7.1 s
- subsequent GPU cases = mostly **~130–180 ms**
- task confidence could be high on wrong decisions;
- repo need was especially weak across the seed;
- fresh-web detection missed both research cases;
- routing still confused study/admin/build/status cases.

Von 1.2's order-invariant architecture is valuable research, but order invariance does not compensate for semantic error on OTHRYS decisions.

Disposition: **NOT QUALIFIED**.

## AgentJev and other open challengers

Additional open System-One projects were located, including AgentJev and other Jev-compatible/local classifiers. They remain **UNTESTED CANDIDATES**.

The current evidence does not justify downloading and wiring every clone. The correct next comparison is hosted Jev itself through the free Vercel OIDC lane, using the identical OTHRYS benchmark.

If real Jev performs materially better, local challengers remain research/fine-tuning candidates. If Jev also performs poorly, the benchmark/question design itself must be reviewed before granting any circuit authority.

## Current ranking rule

There is no production ranking yet.

Observed smoke results:
- Laya typed-decisions: 58%
- Von 1.2: 62%
- hosted Jev: **not yet measured on this exact seed**

Neither local model meets the Router shadow gate defined by OTHRYS.

No challenger has authority, execution access, or automatic fallback status.
