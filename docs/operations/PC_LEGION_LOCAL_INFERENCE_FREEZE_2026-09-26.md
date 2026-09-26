# PC ↔ Legion Local Inference Freeze — 2026-09-26

**Status:** FROZEN / TESTED

## Role split
- `PC` is the primary home workstation and OTHRYS Command Deck.
- `Jeroen-Legion` is the dedicated heavy local-AI worker.
- `VTC-t590` remains infrastructure / recovery / control support.
- Ollama model storage remains on Legion; PC does not carry a duplicate Ollama model library.

## PC defaults
The PC user environment binds generic OTHRYS local-model adapters to Legion:
- `OTHRYS_OLLAMA_ENDPOINT=http://Jeroen-Legion.local:11434`
- `OTHRYS_OLLAMA_MODEL=qwen2.5-coder:7b`

Generic runtime adapters retain `http://127.0.0.1:11434` and `llama3.2:latest` as fallback defaults when those environment values are absent.

## Legion service boundary
- Ollama serves on `0.0.0.0:11434` for the home LAN.
- Windows firewall rule `OTHRYS-Ollama-LAN` permits TCP 11434 only from `LocalSubnet` on the Private profile.
- Launcher: `C:\Users\othry\Othrys-Runtime\othrys-ollama-lan.cmd`.
- Scheduled task: `OTHRYS-Ollama-LAN`, enabled, trigger `At logon`, run as `othry`.

## Verified paths
- PC DNS resolves `Jeroen-Legion.local` on the local network.
- PC `/api/tags` sees the Legion Ollama catalogue.
- OTHRYS `warmLocalAdvisory()` reaches Legion using PC defaults and returns HTTP 200.
- OTHRYS `executeLightSpecialist()` returns a bounded `LOCAL_ADVISORY` through `qwen2.5-coder:7b`.
- OTHRYS `ollamaEmbed()` reaches Legion `embeddinggemma:latest` and returns 768-dimensional vectors.
- Authority remains false and paid usage remains false on these local paths.

## Regression evidence
- Focused adapter tests: 13/13 passed.
- Broad `runtime/os/*.test.mjs`: 410/417 passed.
- Seven broad-suite failures are outside this binding: current Book/component registry drift, Windows Python/PATH execution state, and Training Lab Windows path portability.
- No failure observed in the modified Ollama endpoint/model adapters.

## Operational rule
PC is the interactive control/work surface. Heavy local inference stays on Legion. The PC may still perform normal development and light processing, but OTHRYS must not install or synchronize a second Ollama model library onto PC unless this freeze is explicitly revised.

## Recovery
If the LAN inference path is unavailable, first verify Legion is online, then verify task `OTHRYS-Ollama-LAN`, TCP 11434 listener, and the LocalSubnet firewall rule. Do not expose port 11434 publicly.
