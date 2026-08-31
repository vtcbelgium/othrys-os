import type { EventBus, EventSubscriber, Subscription } from "../domain/EventBus.js";
/**
 * Wire a declarative EventSubscriber onto a bus. This is how a subsystem plugs
 * in: it ships an EventSubscriber (name + which events + handle) and is
 * registered once here. A `"*"` subscriber gets a single wildcard subscription;
 * a typed one gets a subscription per event type, bundled into one Subscription
 * so teardown is atomic.
 */
export declare function registerSubscriber(bus: EventBus, subscriber: EventSubscriber): Subscription;
//# sourceMappingURL=registerSubscriber.d.ts.map