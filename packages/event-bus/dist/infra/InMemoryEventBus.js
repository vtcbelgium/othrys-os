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
export class InMemoryEventBus {
    constructor(repo) {
        this.repo = repo;
        this.registrations = [];
        this.nextId = 0;
    }
    subscribe(type, handler, name) {
        return this.add((event) => event.type === type, handler, name ?? `on:${type}`);
    }
    subscribeAll(handler, name) {
        return this.add(() => true, handler, name ?? "on:*");
    }
    async publish(event) {
        // Durable first: if the event cannot be stored, nothing is delivered.
        await this.repo.append(event);
        const errors = [];
        let delivered = 0;
        // Snapshot so a handler that (un)subscribes mid-dispatch can't disturb it.
        for (const reg of [...this.registrations]) {
            if (!reg.matches(event))
                continue;
            delivered += 1;
            try {
                await reg.handler(event);
            }
            catch (error) {
                errors.push({ subscriber: reg.name, error });
            }
        }
        return { event, delivered, errors };
    }
    add(matches, handler, name) {
        const id = this.nextId++;
        this.registrations.push({ id, name, matches, handler });
        return {
            unsubscribe: () => {
                this.registrations = this.registrations.filter((r) => r.id !== id);
            },
        };
    }
}
//# sourceMappingURL=InMemoryEventBus.js.map