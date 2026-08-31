/** Edge types along which "A depends on / is powered by B" flows. If any of these
 *  targets fails, the source is affected. */
export const DEPENDENCY_EDGES = [
    "depends-on", "powers", "consumes", "routes-through", "stores-in", "authenticated-by", "grants", "preserves", "provides",
];
const MAX_DEPTH = 12;
const MAX_NODES = 400;
/** Generic bounded BFS. `direction` "out" follows from→to; "in" follows to→from. */
function bfs(atlas, rootId, edgeTypes, direction) {
    const root = atlas.get(rootId);
    if (!root)
        return { rootId, found: false, steps: [], notes: [`node "${rootId}" not found`] };
    const seen = new Set([rootId]);
    const steps = [{ node: root, depth: 0, via: null }];
    const notes = [];
    let frontier = [rootId];
    let depth = 0;
    while (frontier.length > 0 && depth < MAX_DEPTH && seen.size < MAX_NODES) {
        depth += 1;
        const next = [];
        for (const id of frontier) {
            for (const nb of atlas.neighbours(id, direction, edgeTypes)) {
                if (seen.has(nb.node.id))
                    continue;
                seen.add(nb.node.id);
                steps.push({ node: nb.node, depth, via: nb.via });
                next.push(nb.node.id);
                if (seen.size >= MAX_NODES) {
                    notes.push(`traversal capped at ${MAX_NODES} nodes`);
                    break;
                }
            }
        }
        frontier = next;
    }
    if (depth >= MAX_DEPTH && frontier.length > 0)
        notes.push(`traversal capped at depth ${MAX_DEPTH}`);
    return { rootId, found: true, steps, notes };
}
/** What does this node RELY ON? (forward over dependency edges.) */
export function dependencies(atlas, id) {
    return bfs(atlas, id, DEPENDENCY_EDGES, "out");
}
/** What is AFFECTED if this node fails/degrades? (reverse over dependency edges.)
 *  Answers "if OpenRouter fails, which capabilities & Titans are affected?". */
export function impact(atlas, id) {
    return bfs(atlas, id, DEPENDENCY_EDGES, "in");
}
/** The event-flow neighbourhood of a Titan or event: publishes / subscribes /
 *  routes-through, both directions, to a shallow depth (the loop, not the world). */
export function eventFlow(atlas, id) {
    const edges = ["publishes", "subscribes", "routes-through"];
    const root = atlas.get(id);
    if (!root)
        return { rootId: id, found: false, steps: [], notes: [`node "${id}" not found`] };
    const seen = new Set([id]);
    const steps = [{ node: root, depth: 0, via: null }];
    // Depth 1: both directions over event edges (publisher↔event↔subscriber/fabric).
    for (const nb of atlas.neighbours(id, "both", edges)) {
        if (seen.has(nb.node.id))
            continue;
        seen.add(nb.node.id);
        steps.push({ node: nb.node, depth: 1, via: nb.via });
        for (const nb2 of atlas.neighbours(nb.node.id, "both", edges)) {
            if (seen.has(nb2.node.id))
                continue;
            seen.add(nb2.node.id);
            steps.push({ node: nb2.node, depth: 2, via: nb2.via });
        }
    }
    return { rootId: id, found: true, steps, notes: [] };
}
/** capability → provider(s) that power it → credential reference(s). */
export function capabilityChain(atlas, capabilityId) {
    const cap = atlas.get(capabilityId);
    if (!cap)
        return { rootId: capabilityId, found: false, steps: [], notes: [`node "${capabilityId}" not found`] };
    const steps = [{ node: cap, depth: 0, via: null }];
    const notes = [];
    // providers that power this capability (incoming "powers").
    const providers = atlas.neighbours(capabilityId, "in", ["powers"]);
    if (providers.length === 0)
        notes.push("no provider powers this capability (unknown / not catalogued)");
    for (const p of providers) {
        steps.push({ node: p.node, depth: 1, via: p.via });
        // credential references that authenticate the provider (outgoing "authenticated-by").
        const creds = atlas.neighbours(p.node.id, "out", ["authenticated-by"]);
        if (creds.length === 0)
            notes.push(`no credential reference known for provider "${p.node.name}"`);
        for (const c of creds)
            steps.push({ node: c.node, depth: 2, via: c.via });
    }
    return { rootId: capabilityId, found: true, steps, notes };
}
/** provider → everything that depends on it (capabilities it powers, credentials
 *  that authenticate it, and transitively the Titans affected). */
export function providerConsumers(atlas, providerId) {
    return bfs(atlas, providerId, ["powers", "authenticated-by", "grants", "depends-on"], "out");
}
/** The distinct nodes (deduped) a traversal reached, excluding the root. */
export function reached(result) {
    return result.steps.filter((s) => s.depth > 0).map((s) => s.node);
}
//# sourceMappingURL=traverse.js.map