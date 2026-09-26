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
