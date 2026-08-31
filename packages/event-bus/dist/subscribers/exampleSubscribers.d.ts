import type { EventBus, EventSubscriber } from "../domain/EventBus.js";
export interface AuditTrailSubscriber {
    subscriber: EventSubscriber;
    /** One compact line per event seen, in arrival order. */
    entries: string[];
}
/**
 * A cross-cutting observer: subscribes to everything and records a trail. The
 * kind of thing a logging / audit subsystem would own — it needs no knowledge
 * of any publisher.
 */
export declare function createAuditTrailSubscriber(): AuditTrailSubscriber;
export interface RewardsSubscriber {
    subscriber: EventSubscriber;
    /** Running count of photo uploads per user. */
    uploadsByUser: Map<string, number>;
}
/**
 * A subsystem that reacts to one event and emits another. When a user reaches
 * the upload threshold, Rewards publishes a `CreditGranted` event (with
 * `causationId` pointing back at the upload) rather than reaching into a credits
 * module. That is the whole thesis of the bus: choreography over direct calls.
 */
export declare function createRewardsSubscriber(bus: EventBus, opts: {
    threshold: number;
    creditAmount?: number;
}): RewardsSubscriber;
//# sourceMappingURL=exampleSubscribers.d.ts.map