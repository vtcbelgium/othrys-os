/**
 * In-memory append-only event store — the only repository the module ships.
 * Events are immutable (frozen at construction), so the log can hand back the
 * same references without any cloning: nothing can mutate a stored fact.
 *
 * Fulfils the exact async contract a durable store would, so the day events go
 * to a real table, a sibling class implements EventRepository and
 * `repositoryProvider.ts` returns it instead — nothing above the seam changes.
 */
export class LocalEventRepository {
    constructor() {
        this.log = [];
    }
    async append(event) {
        this.log.push(event);
    }
    async list() {
        return [...this.log];
    }
    async listByType(type) {
        return this.log.filter((e) => e.type === type);
    }
    async listByAggregate(aggregateId) {
        return this.log.filter((e) => e.metadata.aggregateId === aggregateId);
    }
    async listByCorrelation(correlationId) {
        return this.log.filter((e) => e.metadata.correlationId === correlationId);
    }
    async reset() {
        this.log = [];
    }
}
//# sourceMappingURL=LocalEventRepository.js.map