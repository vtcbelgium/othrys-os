import type { EventBus, EventHandler, PublishResult, Subscription } from "../domain/EventBus.js";
import type { EventOfType, EventType, TitanEvent } from "../domain/events.js";
import type { EventRepository } from "../domain/EventRepository.js";
/**
 * In-memory dispatcher — the local implementation of the event bus.
 *
 * Responsibilities, kept deliberately small:
 *   1. Persist every published event to the append-only store FIRST (so the log
 *      is the source of truth and subscribers only ever see durable facts).
 *   2. Deliver the event to each matching handler, in subscription order.
 *   3. Isolate handler failures — one throwing subscriber never stops the
 *      others, and never fails the publisher; failures come back in the result.
 *
 * The dispatch path here is the module's critical seam and is covered 100%.
 */
export declare class InMemoryEventBus implements EventBus {
    private readonly repo;
    private registrations;
    private nextId;
    constructor(repo: EventRepository);
    subscribe<T extends EventType>(type: T, handler: EventHandler<EventOfType<T>>, name?: string): Subscription;
    subscribeAll(handler: EventHandler, name?: string): Subscription;
    publish(event: TitanEvent): Promise<PublishResult>;
    private add;
}
//# sourceMappingURL=InMemoryEventBus.d.ts.map