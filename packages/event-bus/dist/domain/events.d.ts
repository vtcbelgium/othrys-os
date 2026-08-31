/** Envelope metadata shared by every event. All optional, defaulted to null. */
export interface EventMetadata {
    /** Who triggered the action (user id / agent name), if known. */
    readonly actorId: string | null;
    /** The aggregate/entity the event is about (e.g. a collectible id). */
    readonly aggregateId: string | null;
    /** Groups all events of one workflow/request for tracing. */
    readonly correlationId: string | null;
    /** The id of the event that directly caused this one (choreography chains). */
    readonly causationId: string | null;
    /** The subsystem that emitted the event (e.g. "catalog", "rewards"). */
    readonly source: string | null;
}
/** The typed payload for each event type. The single source of truth. */
export interface EventPayloads {
    CollectibleCreated: {
        collectibleId: string;
        category: string;
        name: string;
        slug: string;
    };
    CollectibleUpdated: {
        collectibleId: string;
        changedFields: string[];
    };
    PhotoUploaded: {
        collectibleId: string;
        mediaId: string;
        url: string;
        role: string;
    };
    PriceImported: {
        collectibleId: string;
        condition: string;
        amount: number;
        currency: string;
        source: string;
    };
    CollectionCreated: {
        collectionId: string;
        ownerId: string;
        name: string;
    };
    WishlistChanged: {
        wishlistId: string;
        ownerId: string;
        collectibleId: string;
        action: "added" | "removed";
    };
    MarketplaceListingCreated: {
        listingId: string;
        sellerId: string;
        collectibleId: string;
        amount: number;
        currency: string;
    };
    BadgeAwarded: {
        userId: string;
        badgeId: string;
        badgeName: string;
    };
    CreditGranted: {
        userId: string;
        amount: number;
        reason: string;
    };
    SearchPerformed: {
        actorId: string | null;
        query: string;
        resultCount: number;
    };
}
/** Every event type as a string-literal union, derived from the payload map. */
export type EventType = keyof EventPayloads;
/** Runtime constants for the event types (handy for subscribing/filtering). */
export declare const EVENT_TYPES: {
    readonly CollectibleCreated: "CollectibleCreated";
    readonly CollectibleUpdated: "CollectibleUpdated";
    readonly PhotoUploaded: "PhotoUploaded";
    readonly PriceImported: "PriceImported";
    readonly CollectionCreated: "CollectionCreated";
    readonly WishlistChanged: "WishlistChanged";
    readonly MarketplaceListingCreated: "MarketplaceListingCreated";
    readonly BadgeAwarded: "BadgeAwarded";
    readonly CreditGranted: "CreditGranted";
    readonly SearchPerformed: "SearchPerformed";
};
export declare const ALL_EVENT_TYPES: EventType[];
/** The immutable event envelope, parameterised by its type. */
export interface DomainEvent<T extends EventType = EventType> {
    readonly id: string;
    readonly type: T;
    /** ISO-8601 timestamp of when the fact occurred. */
    readonly occurredAt: string;
    readonly payload: Readonly<EventPayloads[T]>;
    readonly metadata: EventMetadata;
}
/** The discriminated union of every possible event. */
export type TitanEvent = {
    [T in EventType]: DomainEvent<T>;
}[EventType];
/** Narrow helper: the event shape for a specific type. Defined as a member of
 *  the union (Extract) so it is always assignable back to TitanEvent. */
export type EventOfType<T extends EventType> = Extract<TitanEvent, {
    type: T;
}>;
/** Deterministic overrides — used by tests and by replay/import tooling. */
export interface EventOverrides {
    id?: string;
    occurredAt?: string;
}
/**
 * Build a frozen, immutable domain event. The only sanctioned way to create an
 * event — guarantees id, timestamp, complete metadata, and deep immutability so
 * a subscriber can never mutate a fact other subscribers will also see.
 */
export declare function createEvent<T extends EventType>(type: T, payload: EventPayloads[T], metadata?: Partial<EventMetadata>, overrides?: EventOverrides): DomainEvent<T>;
/** Recursively freeze an object graph so events are immutable at runtime. */
export declare function deepFreeze<T>(value: T): T;
//# sourceMappingURL=events.d.ts.map