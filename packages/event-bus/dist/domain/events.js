// ---------------------------------------------------------------------------
// Project Titan — Titan Event Bus · domain events.
//
// Every significant platform action becomes an IMMUTABLE domain event. An event
// is a fact that already happened: it is named in the past tense, it is frozen
// at construction, and it is never edited or deleted — only appended to the log
// and delivered to subscribers.
//
// The point of the bus (spec 003): every future subsystem communicates through
// these events instead of holding a direct reference to another subsystem. A
// module publishes `PhotoUploaded`; whoever cares (rewards, search indexing,
// audit) subscribes. Neither side imports the other.
//
// Events are a discriminated union on `type`, with a typed payload per type.
// Adding a new event is: add a key to EventPayloads + EVENT_TYPES. Nothing in
// the dispatcher, repository, or subscribers changes.
// ---------------------------------------------------------------------------
/** Runtime constants for the event types (handy for subscribing/filtering). */
export const EVENT_TYPES = {
    CollectibleCreated: "CollectibleCreated",
    CollectibleUpdated: "CollectibleUpdated",
    PhotoUploaded: "PhotoUploaded",
    PriceImported: "PriceImported",
    CollectionCreated: "CollectionCreated",
    WishlistChanged: "WishlistChanged",
    MarketplaceListingCreated: "MarketplaceListingCreated",
    BadgeAwarded: "BadgeAwarded",
    CreditGranted: "CreditGranted",
    SearchPerformed: "SearchPerformed",
};
export const ALL_EVENT_TYPES = Object.keys(EVENT_TYPES);
const DEFAULT_METADATA = {
    actorId: null,
    aggregateId: null,
    correlationId: null,
    causationId: null,
    source: null,
};
/**
 * Build a frozen, immutable domain event. The only sanctioned way to create an
 * event — guarantees id, timestamp, complete metadata, and deep immutability so
 * a subscriber can never mutate a fact other subscribers will also see.
 */
export function createEvent(type, payload, metadata = {}, overrides = {}) {
    const event = {
        id: overrides.id ?? newId(),
        type,
        occurredAt: overrides.occurredAt ?? new Date().toISOString(),
        payload,
        metadata: { ...DEFAULT_METADATA, ...metadata },
    };
    return deepFreeze(event);
}
// --- helpers ---------------------------------------------------------------
function newId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `evt-${crypto.randomUUID()}`;
    }
    return `evt-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}
/** Recursively freeze an object graph so events are immutable at runtime. */
export function deepFreeze(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
        Object.freeze(value);
        for (const key of Object.keys(value)) {
            deepFreeze(value[key]);
        }
    }
    return value;
}
//# sourceMappingURL=events.js.map