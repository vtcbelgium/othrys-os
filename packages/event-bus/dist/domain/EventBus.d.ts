import type { EventOfType, EventType, TitanEvent } from "./events.js";
/**
 * A subscriber callback. May be sync or async; the dispatcher awaits it. A
 * handler must never throw the whole bus down — the dispatcher isolates errors
 * (see PublishResult), but handlers should still be written defensively.
 */
export type EventHandler<E extends TitanEvent = TitanEvent> = (event: E) => void | Promise<void>;
/** Handle returned by every subscribe call. Idempotent unsubscribe. */
export interface Subscription {
    unsubscribe(): void;
}
/** One handler's failure during a publish, captured so others still run. */
export interface SubscriberError {
    /** The subscriber name, or a generated label for anonymous handlers. */
    subscriber: string;
    error: unknown;
}
/** The outcome of a publish: what was delivered and what failed. */
export interface PublishResult {
    event: TitanEvent;
    /** Number of handlers invoked (matched the event). */
    delivered: number;
    /** Isolated handler failures. Empty means every handler succeeded. */
    errors: SubscriberError[];
}
/**
 * The event bus — the dispatch seam every subsystem depends on instead of
 * depending on each other. Publishers call `publish`; consumers `subscribe`.
 * Neither knows the other exists.
 */
export interface EventBus {
    /** Subscribe to one event type. Returns a Subscription for teardown. */
    subscribe<T extends EventType>(type: T, handler: EventHandler<EventOfType<T>>, name?: string): Subscription;
    /** Subscribe to every event type (audit, logging, projections). */
    subscribeAll(handler: EventHandler, name?: string): Subscription;
    /**
     * Append the event to the store, then deliver it to every matching handler.
     * Resolves with a PublishResult; rejects only if the event could not be
     * persisted (in which case nothing is delivered).
     */
    publish(event: TitanEvent): Promise<PublishResult>;
}
/**
 * A declarative subscriber — a named unit that reacts to a fixed set of event
 * types (or all of them). This is how a subsystem plugs into the bus: it ships
 * an EventSubscriber and is registered once. `registerSubscriber` wires it.
 */
export interface EventSubscriber {
    readonly name: string;
    /** Event types this subscriber reacts to, or "*" for all. */
    readonly subscribedTo: readonly EventType[] | "*";
    handle(event: TitanEvent): void | Promise<void>;
}
//# sourceMappingURL=EventBus.d.ts.map