# Grok Mission — Finish OTHRYS Identity / Invitation / Privilege Foundation

Status: ACTIVE HANDOFF
Owner: OTHRYS Grok Architect
Workers: Dispatcher, Builder, Sentinel, Scout, Aegis Auditor
Authority: Jeroen -> GPT Control -> frozen task packet -> worker -> evidence -> GPT Control/Jeroen

## Mission

Finish the remaining OTHRYS account/login/security roadmap from the current live ID-05 state through ID-10.

Do not redesign the foundation unless current repo/live evidence proves a defect. Do not work from memory. Inspect the actual repository, live migration state, CI and current documentation before every unit.

## Current verified state

Repository: `vtcbelgium/othrys-web`.

Already live / built:

- Platform account + access-grant authority foundation.
- Workspace + membership isolation.
- Oro instance isolation.
- USER authenticated workspace/Oro read model.
- Invitation authority table `private.othrys_invitations` live.
- Invitation create/accept/revoke operation contracts.
- Sealed create-invitation operation with SHA-256 bearer digest only.
- Canonical invitation authority reader bound to authenticated Supabase session and RLS.
- Sealed invitation persistence adapter.
- Direct Postgres executor using pinned `postgres@3.4.9`, TLS required, `prepare:false`, one connection, fixed invitation INSERT family only.
- Dedicated `othrys_invitation_writer` role is LIVE:
  - NOLOGIN
  - NOBYPASSRLS
  - NOSUPERUSER / NOCREATEDB / NOCREATEROLE
  - connection limit 4
  - 5s statement + idle transaction timeouts
  - USAGE only on `private`
  - column-level INSERT only on invitation input columns
  - SELECT only on `id` for RETURNING
  - INSERT + SELECT RLS policies only for this role
- Security advisor no longer reports invitation table as RLS-with-no-policy.
- Existing unrelated warnings remain: `study_brother_digest` SECURITY DEFINER exposure and leaked-password protection.
- Live migration history recorded writer role as `20260926223341_invitation_writer_role`.
- Git currently contains `supabase/migrations/20260926221313_invitation_writer_role.sql`.
- Migration-history alignment is therefore the first remaining job.

## Non-negotiable laws

1. One coherent unit per worker. No giant builds.
2. Inspect first, then act.
3. Evidence before the next job.
4. No silent scope growth.
5. Preserve unrelated dirty work.
6. No direct mutation on dirty/main working trees; use isolated worktree/branch.
7. No production deploy, destructive action, external email, purchase/billing change, secret exposure, credential generation, auth/permission mutation or MASTER/break-glass activation without an explicit approval gate.
8. Never weaken Aegis, Labyrinth, Keymaster, RLS, audit, recovery or privilege separation to make a test pass.
9. Never use `user_metadata` for authorization.
10. Never expose Supabase service-role/secret keys to browser code.
11. Raw invitation bearer token never enters database, logs, Mnemosyne, analytics, Git or telemetry.
12. Platform ADMIN authority is not private-workspace authority.
13. USER controls their Oro; USER does not control OTHRYS.
14. MASTER is temporary elevation, never a permanent daily role/session.
15. Private-content inspection is separately governed break-glass, not an implied MASTER capability.
16. Stop when a unit's acceptance gate is met. Dispatcher selects the next unit only from this queue.

## Execution queue

### G-01 — Migration history alignment
Owner: Builder
Risk: low
Approval: autonomous

Goal:
Align the Git migration filename with the live Supabase migration version `20260926223341` without changing SQL semantics.

Acceptance:
- exact SQL content preserved;
- old timestamped file removed;
- new `20260926223341_invitation_writer_role.sql` present;
- DB + web CI green;
- live migration history and Git agree.

Stop immediately after acceptance.

### G-02 — Writer credential design / secret boundary
Owner: Architect + Aegis Auditor
Risk: high
Approval: PLAN AUTONOMOUS; SECRET/LOGIN MUTATION REQUIRES JEROEN/GPT APPROVAL

Goal:
Design the minimal secure way to turn `othrys_invitation_writer` from NOLOGIN into an application credential and provide `OTHRYS_INVITATION_DATABASE_URL` to the server runtime.

Required properties:
- credential never committed;
- no plaintext in logs/Mnemosyne/task packets;
- transaction pooler compatible;
- TLS required;
- dedicated role only;
- rotation/revocation path documented;
- Keymaster-compatible custody;
- no reuse of postgres/admin/service-role credentials.

Acceptance:
A reviewed implementation plan plus exact verification/rollback steps. Stop before live credential creation unless explicit approval exists.

### G-03 — Bind writer into create-invite operation
Owner: Builder
Risk: medium
Approval: autonomous for repo code only

Goal:
Bind `createInvitationRecordWriter(createInvitationPostgresExecutorFromEnv(...))` into a server-only composition layer.

Acceptance:
- fail closed when DB URL missing;
- no connection string/client reaches browser bundle;
- no actor ID accepted from client;
- unit/type/build checks green;
- no route yet.

### G-04 — Create invitation route
Owner: Builder; Sentinel verifies
Risk: medium
Approval: repo code autonomous; no production deploy

Goal:
Add the narrow create-invitation server route.

Required:
- actor derived from authenticated server session;
- canonical authority reader;
- same-origin / CSRF protection appropriate to current Next.js architecture;
- strict body/schema validation;
- bounded expiry;
- safe error mapping;
- no raw-token logging;
- no service-role client;
- no email send in this unit.

Acceptance:
positive/negative tests for unauthenticated, spoofed actor, unauthorized workspace, malformed body, expired/bad expiry, persistence failure and successful account/workspace creation.

### G-05 — Invitation delivery
Owner: Architect + Builder
Risk: medium/high
Approval: code autonomous; REAL EXTERNAL EMAIL SEND REQUIRES APPROVAL

Goal:
Keep delivery separate from authority. Use existing Resend integration if current evidence confirms it is still canonical.

Acceptance:
- email template contains invite link/token without logging token;
- delivery failure does not create hidden privilege;
- retry semantics explicit;
- authority record remains source of truth;
- tests/mocks green.
Stop before real external send unless approved.

### G-06 — Accept invitation
Owner: Builder; Aegis Auditor verifies
Risk: high
Approval: repo/schema code autonomous; production mutation gated

Goal:
Implement acceptance with constant-time bearer proof and exact authenticated email/scope matching.

Required:
- hash presented bearer server-side;
- constant-time digest comparison;
- pending + unexpired only;
- exact target email match;
- account scope only activates account;
- workspace scope grants exact workspace role only;
- invitation marked accepted atomically;
- replay denied;
- no platform/root authority can be invited.

Acceptance:
adversarial tests pass, including wrong token/email/workspace, expired/revoked/accepted replay, cross-user and cross-workspace attempts.

### G-07 — Revoke invitation
Owner: Builder
Risk: medium
Approval: repo/schema code autonomous; live mutation gated

Goal:
Implement narrow revoke operation for pending invites only using the same canonical authority boundaries.

Acceptance:
account revoke requires account-management authority; workspace revoke requires exact workspace owner/admin; no platform bypass; accepted/revoked/expired states cannot be mutated incorrectly.

### G-08 — End-to-end invitation qualification
Owner: Sentinel + Aegis Auditor
Risk: medium
Approval: autonomous in test/local/staging only

Goal:
Test create -> deliver mock -> accept/revoke boundaries end to end.

Acceptance:
CI green; no secret/raw bearer in logs; RLS/advisors checked; USER A/B isolation preserved; negative cases documented.

### G-09 — Create Jeroen Personal true USER
Owner: Architect
Risk: high
Approval: LIVE IDENTITY CREATION REQUIRES JEROEN/GPT APPROVAL

Goal:
Create a genuinely ordinary USER identity with zero invisible operator privilege.

Precondition:
Invitation/login/session flow is qualified.

Acceptance:
Personal identity can access only its own USER surfaces/Oroi/Buddies; cannot reach ADMIN/MASTER routes/data by URL or forged client state.

### G-10 — USER vs ADMIN session split
Owner: Architect + Builder; Aegis Auditor verifies
Risk: high
Approval: code autonomous; production cutover gated

Goal:
Remove legacy ambient privilege assumptions and separate USER and ADMIN security contexts.

Acceptance:
- USER session cannot become ADMIN by UI/client state;
- ADMIN requires canonical server-side authority;
- privileged session/cookie scope minimized;
- no broad cross-subdomain ambient privileged cookie in final design;
- recovery remains fail closed.

### G-11 — MASTER elevation
Owner: Architect + Aegis Auditor
Risk: critical
Approval: LIVE ACTIVATION REQUIRES JEROEN/GPT APPROVAL

Goal:
Implement short-lived MASTER elevation from eligible ADMIN only.

Required:
- root_owner is eligibility, not active MASTER;
- phishing-resistant strong reauth;
- explicit reason;
- max short lifetime (target <=15 min);
- audit start/end;
- automatic expiry;
- visible elevation state;
- explicit end-elevation control.

Acceptance:
ADMIN cannot self-promote without eligibility + strong reauth; stale elevation fails; forged client flags fail.

### G-12 — Break-glass private-content access
Owner: Architect + Aegis Auditor
Risk: critical
Approval: LIVE ACTIVATION/USE REQUIRES JEROEN/GPT APPROVAL

Goal:
Implement private-content inspection as a distinct emergency capability, not ordinary ADMIN/MASTER browsing.

Required:
reason, target, scope, recent strong auth, shortest possible window, audit, expiry/completion, notification policy decision.

Acceptance:
ADMIN and MASTER cannot casually browse private user content; break-glass is explicit, auditable and expires.

### G-13 — Full adversarial qualification / ID-10 close
Owner: Sentinel + Aegis Auditor
Risk: high
Approval: autonomous tests; no destructive production tests without approval

Must prove at minimum:
- User A cannot read/write User B;
- USER cannot reach ADMIN/MASTER by URL;
- forged `user_metadata` cannot elevate;
- ADMIN cannot self-promote;
- ADMIN cannot private-read without break-glass;
- MASTER expires;
- service-role/secret never reaches client;
- invitation token never persists raw;
- publishing cannot leak secrets;
- private learning does not silently become global;
- prompt injection cannot reach files/secrets outside Aegis;
- recovery does not create permanent backdoor.

Acceptance:
Evidence matrix with PASS/FAIL/UNKNOWN. ID-10 closes only with all critical tests PASS and UNKNOWN explicitly resolved or accepted by Jeroen.

## Bot routing

Dispatcher:
- only releases the next queue item after prior acceptance evidence;
- maximum two independent workers in parallel;
- no parallel work across dependent security boundaries.

Architect:
- owns architecture consistency and approval-gate recognition;
- may not grant itself production authority.

Builder:
- uses isolated worktree/branch;
- minimal diff;
- deterministic tests.

Sentinel:
- read-only first;
- checks CI, diff, failure logs, live-vs-Git drift.

Scout:
- current-doc research only when needed;
- returns sources/constraints, never changes architecture by popularity.

Aegis Auditor:
- adversarial reviewer;
- checks privilege escalation, BOLA/IDOR, token leakage, session bleed, secret exposure and bypass paths;
- may veto progression.

## Token / cost discipline

- Cheap/free-first for routine inspection and mechanical changes.
- Grok 4.7 Medium only for architecture/security reasoning that merits it.
- No Fast model by default.
- No Other Models pool or on-demand spend without explicit approval.
- Do not reread entire repositories when exact files/evidence are known.

## Reporting contract

Every worker returns only:
- Outcome
- Scope changed/read
- Verification evidence
- Risks / unknowns
- Next small queue item

A worker saying "done" is never acceptance. Sentinel/Aegis evidence closes security-critical jobs.

## Starting point

Start with **G-01 migration history alignment only**.
Do not jump ahead.
