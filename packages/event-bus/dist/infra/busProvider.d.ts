import type { EventBus } from "../domain/EventBus.js";
export declare function getBus(): EventBus;
/** Test/tooling hook to inject a bus. */
export declare function setBus(next: EventBus): void;
/** Drop the cached bus (tests). */
export declare function resetBusProvider(): void;
//# sourceMappingURL=busProvider.d.ts.map