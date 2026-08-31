/**
 * Wire a declarative EventSubscriber onto a bus. This is how a subsystem plugs
 * in: it ships an EventSubscriber (name + which events + handle) and is
 * registered once here. A `"*"` subscriber gets a single wildcard subscription;
 * a typed one gets a subscription per event type, bundled into one Subscription
 * so teardown is atomic.
 */
export function registerSubscriber(bus, subscriber) {
    if (subscriber.subscribedTo === "*") {
        return bus.subscribeAll((event) => subscriber.handle(event), subscriber.name);
    }
    const subs = subscriber.subscribedTo.map((type) => bus.subscribe(type, (event) => subscriber.handle(event), subscriber.name));
    return {
        unsubscribe: () => {
            for (const s of subs)
                s.unsubscribe();
        },
    };
}
//# sourceMappingURL=registerSubscriber.js.map