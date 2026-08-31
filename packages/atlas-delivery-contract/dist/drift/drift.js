export function detectDrift(graph, now, opts = {}) {
    const findings = [];
    const add = (f) => findings.push(f);
    const inByType = adjacency(graph.edges, "to");
    for (const n of graph.nodes) {
        // 1. A capability with no provider powering it.
        if (n.type === "capability" && !hasEdge(inByType, n.id, "powers")) {
            add({ code: "capability-without-provider", severity: "low", nodeId: n.id,
                message: `capability "${n.name}" has no provider powering it`,
                remediation: "Attribute the capability to a provider in the seed registry, or mark it self-hosted." });
        }
        // 2. An operational/tested claim without evidence basis (integrity — the one that matters).
        if ((n.status === "operational" || n.status === "tested") && n.basis !== "evidence") {
            add({ code: "operational-without-evidence", severity: "high", nodeId: n.id,
                message: `"${n.name}" claims status "${n.status}" but its basis is not evidence`,
                remediation: "Back the status with executable evidence (tests), or lower it to designed/scaffolded." });
        }
        // 3. Unknown status.
        if (n.status === "unknown") {
            add({ code: "unknown-status", severity: "info", nodeId: n.id,
                message: `"${n.name}" has an unknown implementation status`,
                remediation: "Determine and record the status from evidence, or leave it honestly unknown." });
        }
        // 4. Duplicate ownership (owned by more than one owner via "owns").
        const owners = (inByType.get(edgeKey(n.id, "owns")) ?? []).map((e) => e.from);
        if (new Set(owners).size > 1) {
            add({ code: "duplicate-ownership", severity: "medium", nodeId: n.id,
                message: `"${n.name}" is owned by ${new Set(owners).size} owners: ${[...new Set(owners)].join(", ")}`,
                remediation: "A node should have a single accountable owner; resolve the overlap." });
        }
        // 5. A deprecated node still depended on.
        if (n.status === "deprecated") {
            const dependents = (inByType.get(edgeKey(n.id, "depends-on")) ?? []).length + (inByType.get(edgeKey(n.id, "powers")) ?? []).length;
            if (dependents > 0)
                add({ code: "deprecated-still-used", severity: "medium", nodeId: n.id,
                    message: `deprecated "${n.name}" still has ${dependents} dependent(s)`,
                    remediation: "Migrate dependents to the successor, then remove the deprecated node." });
        }
        // 6. Source reference validity (only when a fileExists probe is supplied).
        if (opts.fileExists) {
            for (const s of n.sources) {
                const path = s.ref.split("#")[0];
                if (path && !path.startsWith("http") && !opts.fileExists(path)) {
                    add({ code: "stale-source-reference", severity: "medium", nodeId: n.id,
                        message: `source reference "${s.ref}" for "${n.name}" no longer resolves`,
                        remediation: "Update the provenance to the current path, or remove the node." });
                }
            }
        }
    }
    // 7. Event publisher with no consumer, and consumer with no publisher.
    for (const n of graph.nodes) {
        if (n.type !== "event")
            continue;
        const hasPublisher = hasEdge(inByType, n.id, "publishes");
        const hasConsumer = hasEdge(inByType, n.id, "subscribes");
        if (hasPublisher && !hasConsumer) {
            add({ code: "event-without-consumer", severity: "info", nodeId: n.id,
                message: `event "${n.name}" is published but no in-repo subscriber was found`,
                remediation: "This is often legitimate (a downstream consumer, or a deployment binding). Confirm intended." });
        }
        if (hasConsumer && !hasPublisher) {
            add({ code: "event-without-publisher", severity: "low", nodeId: n.id,
                message: `event "${n.name}" has a subscriber but no known publisher`,
                remediation: "Confirm a producer exists; a consumer with no publisher may be dead code." });
        }
    }
    // 8. Forbidden dependency cycles (depends-on must be acyclic).
    for (const cycle of findCycles(graph.edges.filter((e) => e.type === "depends-on"))) {
        add({ code: "dependency-cycle", severity: "high", nodeId: cycle[0],
            message: `forbidden dependency cycle: ${cycle.join(" → ")} → ${cycle[0]}`,
            remediation: "Break the cycle — dependency direction must be acyclic (a leaf must not import a composer)." });
    }
    const bySeverity = { info: 0, low: 0, medium: 0, high: 0 };
    for (const f of findings)
        bySeverity[f.severity] += 1;
    // Deterministic order: severity desc, then code, then nodeId.
    const rank = { high: 0, medium: 1, low: 2, info: 3 };
    findings.sort((a, b) => rank[a.severity] - rank[b.severity] || a.code.localeCompare(b.code) || (a.nodeId ?? "").localeCompare(b.nodeId ?? ""));
    return { findings, bySeverity, checkedAt: now };
}
// --- helpers ----------------------------------------------------------------
function edgeKey(nodeId, type) { return `${nodeId}::${type}`; }
function adjacency(edges, by) {
    const m = new Map();
    for (const e of edges) {
        const k = edgeKey(by === "from" ? e.from : e.to, e.type);
        (m.get(k) ?? m.set(k, []).get(k)).push(e);
    }
    return m;
}
function hasEdge(m, nodeId, type) {
    return (m.get(edgeKey(nodeId, type)) ?? []).length > 0;
}
/** Find simple cycles in a directed edge set (DFS). Returns node-id paths. */
function findCycles(edges) {
    const adj = new Map();
    for (const e of edges)
        (adj.get(e.from) ?? adj.set(e.from, []).get(e.from)).push(e.to);
    const cycles = [];
    const state = new Map(); // 0=unseen,1=in-stack,2=done
    const stack = [];
    const seenCycle = new Set();
    const dfs = (u) => {
        state.set(u, 1);
        stack.push(u);
        for (const v of adj.get(u) ?? []) {
            const st = state.get(v) ?? 0;
            if (st === 1) {
                const i = stack.indexOf(v);
                const cyc = stack.slice(i);
                const key = [...cyc].sort().join("|");
                if (!seenCycle.has(key)) {
                    seenCycle.add(key);
                    cycles.push(cyc);
                }
            }
            else if (st === 0)
                dfs(v);
        }
        stack.pop();
        state.set(u, 2);
    };
    for (const u of adj.keys())
        if ((state.get(u) ?? 0) === 0)
            dfs(u);
    return cycles;
}
/** Nodes present in code (packages) but absent from a provided inventory list —
 *  and inventory entries with no matching node. Pure; the caller supplies the
 *  inventory package names (from SYSTEM-INVENTORY) so nothing is inferred. */
export function inventoryDrift(graph, inventoryPackageNames) {
    const out = [];
    const inv = new Set(inventoryPackageNames);
    const pkgNodes = graph.nodes.filter((n) => ["service", "titan", "application", "bridge", "event-fabric", "library-wing", "constitution", "interface"].includes(n.type) && n.implementationLocation);
    for (const n of pkgNodes) {
        const name = deriveName(n);
        if (name && !inv.has(name))
            out.push({ code: "package-missing-from-inventory", severity: "low", nodeId: n.id,
                message: `package "${name}" (${n.id}) is not listed in the provided inventory`,
                remediation: "Add the package to SYSTEM-INVENTORY, or confirm it is intentionally omitted." });
    }
    return out;
}
function deriveName(n) {
    const s = n.sources.find((x) => x.kind === "package.json");
    return s ? s.ref.replace(/\/package\.json$/, "").replace(/^titan\//, "") : null;
}
//# sourceMappingURL=drift.js.map