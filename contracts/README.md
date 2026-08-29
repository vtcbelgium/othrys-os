# OTHRYS OS Component Contracts

Component Contracts are compact anti-drift interfaces. A Book explains what/why/history/boundary; a contract states operational ownership, IO, dependencies, touch limits, authority, evidence and bounded loop behavior. Contracts do not grant authority and do not replace implementation, tests, mission evidence or Books.

Required fields: ID, Book, Owner, Purpose, Inputs, Outputs, Dependencies, Allowed touch, Forbidden touch, Authority, Evidence. Every contract also carries the Loop Laws fields OWNER, TRIGGER, INPUT, STATE, BUDGET, EXIT CONDITION, EVIDENCE, STALL/FAILURE. Use `NONE` explicitly when a recurring loop does not exist.

Coverage law: exactly one contract exists for every current `books/BOOK_REGISTRY.json` target; Quarry-only surfaces receive none. Drift is a test failure.
