// ---------------------------------------------------------------------------
// @othrys-core/event-bus — the Othrys domain event bus · public API.
// Pure domain. No UI, no React, no Supabase, no HTTP.
// ---------------------------------------------------------------------------
export * from "./domain/events.js";
export { InMemoryEventBus } from "./infra/InMemoryEventBus.js";
export { LocalEventRepository } from "./infra/LocalEventRepository.js";
export { getRepository, setRepository, resetRepositoryProvider, } from "./infra/repositoryProvider.js";
export { getBus, setBus, resetBusProvider } from "./infra/busProvider.js";
export { registerSubscriber } from "./subscribers/registerSubscriber.js";
export { createAuditTrailSubscriber, createRewardsSubscriber, } from "./subscribers/exampleSubscribers.js";
//# sourceMappingURL=index.js.map