const DEFAULT_LIMIT = 500;
export class Atlas {
    constructor(graph) {
        this.graph = graph;
        this.nodeById = new Map();
        this.outByNode = new Map();
        this.inByNode = new Map();
        for (const n of graph.nodes)
            this.nodeById.set(n.id, n);
        for (const e of graph.edges) {
            (this.outByNode.get(e.from) ?? this.outByNode.set(e.from, []).get(e.from)).push(e);
            (this.inByNode.get(e.to) ?? this.inByNode.set(e.to, []).get(e.to)).push(e);
        }
    }
    /** The whole graph (already secret-free). */
    full() { return this.graph; }
    generatedAt() { return this.graph.generatedAt; }
    summary() { return this.graph.summary; }
    get(id) { return this.nodeById.get(id); }
    has(id) { return this.nodeById.has(id); }
    nodes() { return this.graph.nodes; }
    edges() { return this.graph.edges; }
    /** All edges touching a node, in the requested direction. */
    edgesOf(id, direction = "both") {
        const out = direction === "in" ? [] : (this.outByNode.get(id) ?? []);
        const inc = direction === "out" ? [] : (this.inByNode.get(id) ?? []);
        return [...out, ...inc];
    }
    /** The one-hop neighbourhood of a node. */
    neighbours(id, direction = "both", edgeTypes) {
        const result = [];
        const pass = (e) => !edgeTypes || edgeTypes.includes(e.type);
        if (direction !== "in")
            for (const e of this.outByNode.get(id) ?? []) {
                const node = this.nodeById.get(e.to);
                if (node && pass(e))
                    result.push({ node, via: e, direction: "out" });
            }
        if (direction !== "out")
            for (const e of this.inByNode.get(id) ?? []) {
                const node = this.nodeById.get(e.from);
                if (node && pass(e))
                    result.push({ node, via: e, direction: "in" });
            }
        return result;
    }
    /** The children of a node under `contains` (for progressive disclosure). */
    children(id) {
        return this.neighbours(id, "out", ["contains"]).map((n) => n.node).sort((a, b) => a.name.localeCompare(b.name));
    }
    // --- filters (each bounded) ----------------------------------------------
    byType(type, limit = DEFAULT_LIMIT) { return this.filter((n) => n.type === type, limit); }
    byStatus(status, limit = DEFAULT_LIMIT) { return this.filter((n) => n.status === status, limit); }
    byHealth(health, limit = DEFAULT_LIMIT) { return this.filter((n) => n.health === health, limit); }
    byRisk(risk, limit = DEFAULT_LIMIT) { return this.filter((n) => n.risk === risk, limit); }
    byDomain(domain, limit = DEFAULT_LIMIT) { return this.filter((n) => n.domain === domain, limit); }
    /** Nodes owned by (or being) a given Titan/owner id. */
    byOwner(owner, limit = DEFAULT_LIMIT) { return this.filter((n) => n.owner === owner, limit); }
    filter(pred, limit) {
        const out = [];
        for (const n of this.graph.nodes) {
            if (pred(n))
                out.push(n);
            if (out.length >= limit)
                break;
        }
        return out;
    }
    /** Case-insensitive search over id / name / tags / description. Bounded. */
    search(query, limit = 50) {
        const q = query.trim().toLowerCase();
        if (q.length === 0)
            return [];
        const out = [];
        for (const n of this.graph.nodes) {
            const hay = `${n.id} ${n.name} ${n.tags.join(" ")} ${n.description}`.toLowerCase();
            if (hay.includes(q))
                out.push(n);
            if (out.length >= limit)
                break;
        }
        return out;
    }
    /** Documentation references reachable from a node (its own + linked ADRs). */
    documentationFor(id) {
        const node = this.nodeById.get(id);
        if (!node)
            return [];
        const docs = new Set(node.docRefs);
        for (const nb of this.neighbours(id, "both", ["documented-by"])) {
            for (const d of nb.node.docRefs)
                docs.add(d);
        }
        return [...docs].sort();
    }
}
//# sourceMappingURL=atlas.js.map