import { InMemoryEventBus } from "./InMemoryEventBus.js";
import { getRepository } from "./repositoryProvider.js";
/**
 * The single access point to the shared bus. Every subsystem calls `getBus()`
 * and talks to the same dispatcher — that is what lets them communicate through
 * events instead of importing one another. The bus is wired to whatever
 * repository `repositoryProvider` currently returns.
 */
let bus = null;
export function getBus() {
    if (bus)
        return bus;
    bus = new InMemoryEventBus(getRepository());
    return bus;
}
/** Test/tooling hook to inject a bus. */
export function setBus(next) {
    bus = next;
}
/** Drop the cached bus (tests). */
export function resetBusProvider() {
    bus = null;
}
//# sourceMappingURL=busProvider.js.map