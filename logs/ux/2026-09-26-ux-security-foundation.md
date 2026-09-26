# UX / Identity Security Foundation — 2026-09-26

## Mission

Establish the security-first human/account architecture for OTHRYS before expanding the user-facing UI or replacing the current owner login.

## Repository evidence reviewed

- othrys-web `ARCHITECTURE.md`
- othrys-web `MASTER-PLAN.md`
- othrys-web `docs/product/WEBSITE-SKELETON-v0.md`
- othrys-web `docs/venture/OTHRYS-BE-SHOWCASE-DOCTRINE.md`
- othrys-web `docs/product/OTHRYS-DESIGN-PRINCIPLES.md`
- existing control owner allowlist/session code
- existing manager-device pairing code
- Study Buddy owner-scoped Supabase RLS/storage policies
- Book of Keymaster
- Book of Mnemosyne
- Buddy Factory shared-learning law

## Important findings

1. The current othrys-web `/admin` account table is explicitly fixture/sample UI. It is not a real account system.
2. The real current privileged boundary is the fixed/allowlisted owner Supabase session.
3. Existing product doctrine already anticipated users, roles, multiple Oroi, privacy-controlled analytics, export/deletion and executive administration.
4. Study Buddy already demonstrates the correct baseline pattern of authenticated ownership plus RLS.
5. Current owner/session patterns must not simply be broadened into a multi-user system. User, admin and master contexts need explicit isolation.
6. Supabase passkey/WebAuthn support exists but is currently experimental; architecture may target it while production dependency waits for qualification.
7. Supabase AAL/MFA can support stronger privileged-session policy, but UI presence alone is insufficient: enforcement must exist at API/data boundaries.

## Decisions frozen in this mission

- Three faces: USER, ADMIN, MASTER.
- Jeroen receives a real USER identity with zero implicit operator privilege.
- MASTER is short-lived elevation, not a permanent everyday login.
- Normal user home is Mountain-first and progressively discloses Buddies, Oroi, Workspace, Portfolio, Learning and Settings.
- Workspace is private by default; Portfolio is explicit publication.
- Users control their Oroi, not OTHRYS infrastructure.
- Git is not the canonical store for erasable private behavioural/account data.
- Personal learning, operational telemetry, product learning and global OTHRYS learning are separate classes.
- Private content cannot become global learning without a sanitisation/provenance gate.
- Raw user API keys belong behind Keymaster-compatible custody.
- ADMIN private-content access requires governed break-glass.
- Security requirements are part of UX and become release gates.

## Not changed yet

- live auth behaviour;
- Supabase production schema;
- account creation/registration;
- cookies;
- current owner allowlist;
- Study Buddy RLS;
- admin routes;
- deployment.

This is deliberate. The current boundary remains intact until the replacement identity model has implementation tests and a migration path.

## Next safe implementation batch

1. Add provider-neutral TypeScript identity/capability models in othrys-web.
2. Add boundary unit tests for USER / ADMIN / MASTER decisions.
3. Add the USER information-architecture shell without wiring privileged actions.
4. Design the account/security settings read model.
5. Only after those tests exist, plan the Supabase schema migration and Jeroen dogfood USER account.


## Implementation batch 2 — normal USER dogfood shell

Implemented in `othrys-web` without changing production account/auth behaviour:

- provider-neutral normal-user information architecture;
- protected `/control/user-preview` dogfood surface;
- Mountain-first prompt modal that performs no network/command action;
- first-class Buddy cards for existing private products;
- explicit Workspace / Portfolio / Learning distinction;
- visible privacy boundary and security/data section;
- `View as USER` switch from Mission Control;
- sanitised account/security read model for sessions, factors, connected services, API-key metadata, learning and data controls;
- tests preventing system-control terminology from entering the normal USER model and preventing raw secret fields from entering the account-security projection.

The user preview remains behind the current owner gate until real USER authentication, per-user RLS and session isolation are qualified.


## Implementation batch 3 — ADMIN / MASTER separation

Implemented in `othrys-web`:

- typed ADMIN surface limited to accounts/access/products/support/usage/audit/incidents;
- typed MASTER surface for system/Aegis/Keymaster/Mnemosyne/models/training/policy/infrastructure/root audit;
- tests preventing MASTER internals from leaking into ADMIN;
- protected `/control/admin-preview` with no fake accounts/counts and no mutation;
- protected `/control/master-preview` where every root area is explicitly locked pending elevation;
- Mission Control dogfood switches for USER, ADMIN and the locked MASTER model.

No runtime role grant, MASTER elevation or user-content privilege was added.


## Implementation batch 4 — account and authentication architecture

Live OTHRYS Supabase was inspected read-only before designing the next account layer.

Observed existing foundation:
- `othrys_accounts`;
- `othrys_organizations`;
- `othrys_oroi`;
- `othrys_access_grants`;
- one current platform `root_owner` grant;
- Study Buddy, Money Buddy and Travel Buddy catalogue rows.

Decisions:
- preserve live authority foundation rather than create a duplicate account system;
- treat current `othrys_oroi` as compatibility product catalogue;
- add future workspace-owned Oro instances separately;
- `root_owner` means ADMIN + MASTER eligibility only;
- suspended account means inactive / zero capabilities;
- normal invitation flow cannot grant platform authority;
- future sessions are host-only USER / ADMIN / MASTER contexts;
- MASTER has no standalone login and max 15-minute requested elevation.

Security audit findings recorded in othrys-web:
- live September 25 admin-authority migrations are missing from Git;
- account tables currently inherit broad anon/authenticated PostgreSQL grants and rely on RLS;
- legacy Study brother-digest SECURITY DEFINER RPC is advisor-flagged;
- leaked-password protection is disabled.

No production database or auth mutation was performed.


## Implementation batch 5 — migration truth recovery and hardening drafts

The live Supabase migration-history table retained the original SQL statement arrays for the two missing 2026-09-25 authority migrations. These were recovered exactly into the othrys-web Git migration directory, closing the migration-source drift without executing production DDL.

Added reviewed, non-production SQL drafts for:
- least-privilege authority-table grants;
- active-account enforcement for organization/product-catalog reads;
- personal/team workspaces;
- workspace memberships;
- per-workspace Oro instances;
- private-by-default Oro visibility.

Static tests keep the drafts read-only to direct clients and prevent public SECURITY DEFINER patterns.

An adversarial identity matrix now tests:
- Alice vs Bob isolation;
- viewer read-only;
- suspended user = zero capabilities;
- platform_admin != MASTER;
- root_owner requires elevation;
- USER/ADMIN/MASTER sessions are not interchangeable.


## Implementation batch 6 — privileged security + privacy learning UX

Added to othrys-web:

- draft-only private tables for MASTER elevations, break-glass grants and append-only security audit evidence;
- 15-minute max privileged windows;
- no direct browser role access to privileged tables;
- telemetry/learning policy code separating security, reliability, product analytics and personalization;
- secret telemetry refusal;
- raw-user-content refusal for global learning;
- optional analytics consent gate;
- sanitiser requirement before generic lessons reach global learning;
- single-click evidence prevented from becoming a stable preference;
- USER Personal Learning preview with Correct / Forget / Why affordances;
- USER Security & Data preview with passkeys, sessions, storage, connections, API-key custody, learning, analytics, export and deletion;
- USER shell navigation wired to these surfaces.

No production collection, privileged elevation or user-data mutation was enabled.
