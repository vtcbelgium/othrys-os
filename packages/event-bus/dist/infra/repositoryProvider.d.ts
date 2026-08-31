import type { EventRepository } from "../domain/EventRepository.js";
export declare function getRepository(): EventRepository;
/** Test/tooling hook to inject a repository. */
export declare function setRepository(repo: EventRepository): void;
/** Drop the cached instance (tests). */
export declare function resetRepositoryProvider(): void;
//# sourceMappingURL=repositoryProvider.d.ts.map