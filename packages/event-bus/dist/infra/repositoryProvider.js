import { LocalEventRepository } from "./LocalEventRepository.js";
/**
 * The single switch between event-store backends — identical seam to the
 * previous Titan modules. This is the ONLY file that decides which concrete
 * repository is used. Today it returns the in-memory store; a durable store
 * drops in here with no change to the bus or any subscriber.
 */
let instance = null;
export function getRepository() {
    if (instance)
        return instance;
    instance = new LocalEventRepository();
    return instance;
}
/** Test/tooling hook to inject a repository. */
export function setRepository(repo) {
    instance = repo;
}
/** Drop the cached instance (tests). */
export function resetRepositoryProvider() {
    instance = null;
}
//# sourceMappingURL=repositoryProvider.js.map