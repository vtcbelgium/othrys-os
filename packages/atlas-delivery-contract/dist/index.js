// @othrys-core/atlas-delivery-contract — synced from titan/atlas/dist-contract.
// Do not edit here. Change titan/atlas/src, run `npm run atlas:publish` in othrys-core,
// then `npm run sync` in this package.
// The browser-safe door to the Atlas. Products import ONLY from here.
export * from "./domain/atlas-model.js";
export * from "./contract/atlas-contract.js";
export { Atlas } from "./read-model/atlas.js";
export { dependencies, impact, eventFlow, capabilityChain, providerConsumers, reached, DEPENDENCY_EDGES, } from "./read-model/traverse.js";
export { detectDrift, inventoryDrift } from "./drift/drift.js";
export { EVIDENCE_SCHEMA_VERSION, PROOF_STATUSES, PROOF_FRESH_MS, assess, countsAsProof, hasUsableProvenance, summariseProof, noProof, noProofSummary, toLedger, validateEvidence, } from "./proof/evidence.js";
export { statusOverlay, healthOverlay, riskOverlay } from "./render/overlays.js";
//# sourceMappingURL=index.js.map