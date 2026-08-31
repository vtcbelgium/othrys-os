import type { EventRepository } from "../domain/EventRepository.js";
import type { EventOfType, EventType, TitanEvent } from "../domain/events.js";
/**
 * In-memory append-only event store — the only repository the module ships.
 * Events are immutable (frozen at construction), so the log can hand back the
 * same references without any cloning: nothing can mutate a stored fact.
 *
 * Fulfils the exact async contract a durable store would, so the day events go
 * to a real table, a sibling class implements EventRepository and
 * `repositoryProvider.ts` returns it instead — nothing above the seam changes.
 */
export declare class LocalEventRepository implements EventRepository {
    private log;
    append(event: TitanEvent): Promise<void>;
    list(): Promise<TitanEvent[]>;
    listByType<T extends EventType>(type: T): Promise<EventOfType<T>[]>;
    listByAggregate(aggregateId: string): Promise<TitanEvent[]>;
    listByCorrelation(correlationId: string): Promise<TitanEvent[]>;
    reset(): Promise<void>;
}
//# sourceMappingURL=LocalEventRepository.d.ts.map