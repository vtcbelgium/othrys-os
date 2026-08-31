import type { AtlasGraph, AtlasNode, AtlasEdge, AtlasNodeType, AtlasStatus, AtlasEdgeType, AtlasHealth, AtlasRisk } from "../domain/atlas-model.js";
export type EdgeDirection = "out" | "in" | "both";
/** A node plus the edge that reached it — for neighbourhood/traversal results. */
export interface AtlasNeighbour {
    readonly node: AtlasNode;
    readonly via: AtlasEdge;
    readonly direction: "out" | "in";
}
export declare class Atlas {
    private readonly graph;
    private readonly nodeById;
    private readonly outByNode;
    private readonly inByNode;
    constructor(graph: AtlasGraph);
    /** The whole graph (already secret-free). */
    full(): AtlasGraph;
    generatedAt(): string;
    summary(): import("../domain/atlas-model.js").AtlasSummary;
    get(id: string): AtlasNode | undefined;
    has(id: string): boolean;
    nodes(): readonly AtlasNode[];
    edges(): readonly AtlasEdge[];
    /** All edges touching a node, in the requested direction. */
    edgesOf(id: string, direction?: EdgeDirection): AtlasEdge[];
    /** The one-hop neighbourhood of a node. */
    neighbours(id: string, direction?: EdgeDirection, edgeTypes?: readonly AtlasEdgeType[]): AtlasNeighbour[];
    /** The children of a node under `contains` (for progressive disclosure). */
    children(id: string): AtlasNode[];
    byType(type: AtlasNodeType, limit?: number): AtlasNode[];
    byStatus(status: AtlasStatus, limit?: number): AtlasNode[];
    byHealth(health: AtlasHealth, limit?: number): AtlasNode[];
    byRisk(risk: AtlasRisk, limit?: number): AtlasNode[];
    byDomain(domain: string, limit?: number): AtlasNode[];
    /** Nodes owned by (or being) a given Titan/owner id. */
    byOwner(owner: string, limit?: number): AtlasNode[];
    private filter;
    /** Case-insensitive search over id / name / tags / description. Bounded. */
    search(query: string, limit?: number): AtlasNode[];
    /** Documentation references reachable from a node (its own + linked ADRs). */
    documentationFor(id: string): string[];
}
//# sourceMappingURL=atlas.d.ts.map