import type { Atlas } from "./atlas.js";
import type { AtlasEdge, AtlasEdgeType, AtlasNode } from "../domain/atlas-model.js";
/** Edge types along which "A depends on / is powered by B" flows. If any of these
 *  targets fails, the source is affected. */
export declare const DEPENDENCY_EDGES: readonly AtlasEdgeType[];
export interface TraversalStep {
    readonly node: AtlasNode;
    readonly depth: number;
    readonly via: AtlasEdge | null;
}
export interface TraversalResult {
    readonly rootId: string;
    readonly found: boolean;
    readonly steps: readonly TraversalStep[];
    /** Honest unknowns: e.g. "traversal capped at depth N", "root not found". */
    readonly notes: readonly string[];
}
/** What does this node RELY ON? (forward over dependency edges.) */
export declare function dependencies(atlas: Atlas, id: string): TraversalResult;
/** What is AFFECTED if this node fails/degrades? (reverse over dependency edges.)
 *  Answers "if OpenRouter fails, which capabilities & Titans are affected?". */
export declare function impact(atlas: Atlas, id: string): TraversalResult;
/** The event-flow neighbourhood of a Titan or event: publishes / subscribes /
 *  routes-through, both directions, to a shallow depth (the loop, not the world). */
export declare function eventFlow(atlas: Atlas, id: string): TraversalResult;
/** capability → provider(s) that power it → credential reference(s). */
export declare function capabilityChain(atlas: Atlas, capabilityId: string): TraversalResult;
/** provider → everything that depends on it (capabilities it powers, credentials
 *  that authenticate it, and transitively the Titans affected). */
export declare function providerConsumers(atlas: Atlas, providerId: string): TraversalResult;
/** The distinct nodes (deduped) a traversal reached, excluding the root. */
export declare function reached(result: TraversalResult): AtlasNode[];
//# sourceMappingURL=traverse.d.ts.map