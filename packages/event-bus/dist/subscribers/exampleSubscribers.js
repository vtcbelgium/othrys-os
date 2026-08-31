import { createEvent } from "../domain/events.js";
/**
 * A cross-cutting observer: subscribes to everything and records a trail. The
 * kind of thing a logging / audit subsystem would own — it needs no knowledge
 * of any publisher.
 */
export function createAuditTrailSubscriber() {
    const entries = [];
    return {
        entries,
        subscriber: {
            name: "audit-trail",
            subscribedTo: "*",
            handle(event) {
                entries.push(`${event.occurredAt} ${event.type} ${event.id}`);
            },
        },
    };
}
/**
 * A subsystem that reacts to one event and emits another. When a user reaches
 * the upload threshold, Rewards publishes a `CreditGranted` event (with
 * `causationId` pointing back at the upload) rather than reaching into a credits
 * module. That is the whole thesis of the bus: choreography over direct calls.
 */
export function createRewardsSubscriber(bus, opts) {
    const uploadsByUser = new Map();
    const creditAmount = opts.creditAmount ?? 50;
    return {
        uploadsByUser,
        subscriber: {
            name: "rewards",
            subscribedTo: ["PhotoUploaded"],
            async handle(event) {
                if (event.type !== "PhotoUploaded")
                    return;
                const user = event.metadata.actorId;
                if (!user)
                    return;
                const count = (uploadsByUser.get(user) ?? 0) + 1;
                uploadsByUser.set(user, count);
                if (count === opts.threshold) {
                    await bus.publish(createEvent("CreditGranted", {
                        userId: user,
                        amount: creditAmount,
                        reason: `Reached ${opts.threshold} photo uploads`,
                    }, {
                        actorId: "rewards",
                        aggregateId: user,
                        causationId: event.id,
                        source: "rewards",
                    }));
                }
            },
        },
    };
}
//# sourceMappingURL=exampleSubscribers.js.map