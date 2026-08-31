import type { EventOfType, EventType, TitanEvent } from "./events.js";
/**
 * The event store — an append-only log of immutable events. Same async
 * repository abstraction as the previous Titan modules (Mission Control /
 * Collectible Engine): the bus depends only on this interface, never on a
 * concrete store; swapping the in-memory implementation for a durable one is a
 * one-line change in `infra/repositoryProvider.ts`.
 *
 * There is deliberately NO update or delete: events are facts. The only writes
 * are `append` (add a new fact) and `reset` (wipe — for tests/tooling).
 */
export interface EventRepository {
    /** Append one event to the end of the log. */
    append(event: TitanEvent): Promise<void>;
    /** The whole log, in append order. */
    list(): Promise<TitanEvent[]>;
    /** Every event of a given type, in append order. */
    listByType<T extends EventType>(type: T): Promise<EventOfType<T>[]>;
    /** Every event about a given aggregate id (metadata.aggregateId). */
    listByAggregate(aggregateId: string): Promise<TitanEvent[]>;
    /** Every event sharing a correlation id (one workflow), in append order. */
    listByCorrelation(correlationId: string): Promise<TitanEvent[]>;
    /** Wipe the log. */
    reset(): Promise<void>;
}
//# sourceMappingURL=EventRepository.d.ts.map