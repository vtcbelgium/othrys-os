# The Book of UX

**Status:** OTHRYS OS UX / identity foundation — security-first, evidence-bound, non-authoritative by itself.

## Purpose

The Book of UX defines how humans enter, understand, control and leave OTHRYS without exposing more power, data or complexity than they need.

UX is part of the security boundary. A screen that suggests authority a user does not actually possess is a defect. A screen that hides a consequential action behind ambiguous wording is a defect. A screen that exposes operational detail without a user job is an information leak.

OTHRYS must be calm for ordinary users and explicit for operators.

> **THE USER CONTROLS THEIR ORO. THE USER DOES NOT CONTROL OTHRYS.**

> **AUTHORITY IS PROVED SERVER-SIDE, NEVER INFERRED FROM A SCREEN.**

> **PRIVATE EXPERIENCE MAY TEACH THE USER'S OTHRYS. ONLY SANITISED GENERIC LESSONS MAY TEACH GLOBAL OTHRYS.**

---

## 1. Three faces

OTHRYS has three human-facing security contexts.

### USER

For a normal person using OTHRYS products.

The USER surface exposes only the person's own work, Buddies, Oroi, workspace, portfolio, learning controls, settings and explicitly granted connections.

The USER surface must not expose:
- System Manager;
- Aegis internals;
- Keymaster inventory or provider secrets;
- model-routing controls;
- training/test benches;
- other users;
- infrastructure health that has no user-facing consequence;
- administrative metadata.

Jeroen must have a genuine USER account with no inherited operator privilege. This is the permanent dogfood identity.

### ADMIN

For account/support/operations work.

ADMIN may manage:
- account state;
- invitations;
- entitlement/product access;
- workspace/Oro assignment;
- aggregate usage;
- support cases;
- incidents;
- audit records appropriate to the role.

ADMIN does not automatically gain:
- Keymaster secret access;
- root policy control;
- model-provider credentials;
- unrestricted access to private user content;
- MASTER capability.

### MASTER

For OTHRYS root operation.

MASTER may operate System Manager, Aegis, Keymaster policy, Mnemosyne governance, model/Jev policy, training/testing, feature gates, infrastructure controls and administrative-role assignment.

MASTER is **not** an everyday persistent login state. It is a short-lived elevation from an authorised operator identity after a stronger authentication ceremony.

Private user-content inspection is not normal MASTER behaviour. It requires a separately justified break-glass action and immutable audit evidence.

---

## 2. Identity model

The intended long-term model is:

```
PERSON
  |
  +-- ACCOUNT
        |
        +-- MEMBERSHIP / CAPABILITIES
        |
        +-- WORKSPACE
              |
              +-- ORO
              |    +-- PROJECT
              |    +-- BUDDY
              |    +-- ARTIFACT
              |
              +-- PORTFOLIO PROJECTION
```

Identity and authority are separate.

A person's profile name, display preferences or user-editable metadata must never grant authority.

Authorisation facts must come from a server-controlled source and be checked at every consequential boundary.

Future organisations/teams may add memberships and scoped capabilities without changing the USER mental model.

---

## 3. Capability law

OTHRYS uses capabilities/scopes rather than trusting page names.

Examples:

- `workspace.read`
- `workspace.write`
- `oros.create`
- `oros.publish`
- `buddy.study.use`
- `portfolio.publish`
- `account.export`
- `account.delete.request`
- `admin.accounts.read`
- `admin.accounts.manage`
- `admin.support.breakglass.request`
- `master.system.read`
- `master.system.control`
- `master.keymaster.policy`
- `master.aegis.policy`

Rules:

1. No role grants itself authority.
2. UI visibility is never authorisation.
3. Server and data-layer policy remain authoritative.
4. Deny by default.
5. Capabilities are scoped to the narrowest useful resource.
6. Consequential capability changes require audit evidence.
7. MASTER capability is time-bounded and re-authenticated.
8. A support/admin role never silently becomes a data-reader role.

---

## 4. Authentication doctrine

### USER target

Preferred experience:

```
OTHRYS
[ Continue with passkey ]
[ Use another method ]
```

Passkeys/WebAuthn are the target primary sign-in because they remove reusable password secrets and are phishing-resistant.

Current Supabase passkey support is experimental. OTHRYS may prototype and qualify it, but must not make production account survival depend on an experimental API until qualification evidence exists.

Until then, established Supabase authentication remains the bootstrap/recovery path.

### ADMIN target

ADMIN requires:
- an authorised operator identity;
- recent strong authentication;
- short idle timeout for privileged screens;
- re-authentication before high-impact account actions.

### MASTER target

MASTER requires:
- authorised operator identity;
- stronger, phishing-resistant re-authentication;
- short-lived elevation;
- explicit reason/context;
- audit start/end;
- automatic expiry;
- no cross-subdomain ambient privilege.

Two independent recovery credentials should exist for the root operator, with one kept offline.

### Session law

- Privileged sessions use host-only cookies wherever possible.
- USER and privileged contexts do not share ambient privilege through a broad domain cookie.
- Secrets are never stored in browser-readable storage.
- Privileged session identifiers are rotated/expired aggressively.
- Logging out or suspending a privileged identity must invalidate privileged capability, not merely hide UI.
- Sensitive operations may validate current session identity/assurance again rather than trusting stale client state.

---

## 5. User OTHRYS

The USER home must be simple enough that OTHRYS complexity disappears.

Primary surface:

```
                MOUNTAIN

        What do you want to do?

          [ Ask OTHRYS... ]

      Study   Build   Explore
```

Primary areas:

### Mountain
Universal prompt, recent work, current tasks and useful suggestions.

### Oroi
The user's project worlds. Each Oro contains only the controls required to operate that project.

### Buddies
OTHRYS products available to the user. Study Buddy is the anchor Buddy.

### Workspace
Private work-in-progress: code, snippets, files, experiments, mini-apps, sites and drafts.

### Portfolio
An explicit public projection of selected Workspace/Oro artifacts.

Nothing becomes public merely because it exists.

### Learning
A human-readable explanation of what the user's OTHRYS currently believes it has learned, where the belief came from, its confidence, and controls to correct/forget it.

### Settings
Account, security, data/learning, storage/sync, connections and developer/API-key controls.

---

## 6. Oro control model

An Oro is the user's controlled world, not a window into OTHRYS infrastructure.

A generic Oro may expose:

```
Overview
Build
Files
Preview
Publish
Data
Connections
Activity
```

The exact navigation is product-dependent.

Permanent law:

> **OWNERSHIP OF AN ORO DOES NOT IMPLY AUTHORITY OVER THE FACTORY THAT BUILT IT.**

Provider credentials, deployment credentials, root model routing, Aegis, Keymaster and OTHRYS system topology remain outside the USER authority plane.

---

## 7. Workspace and Portfolio law

Workspace is private by default.

Portfolio is opt-in publication.

Publishing requires:
- an explicit human action;
- a preview of what becomes public;
- removal/redaction of secrets and private metadata;
- provenance to the source artifact;
- reversible unpublish where technically possible.

OTHRYS must never silently publish:
- drafts;
- raw prompts;
- private learning;
- environment variables;
- access tokens;
- private repository locations;
- hidden metadata.

---

## 8. Storage law

Different information requires different stores.

| Data class | Preferred home |
| --- | --- |
| Identity/account | Auth + protected account database |
| Authorisation | Server-controlled policy store / app metadata where appropriate |
| Oro/project metadata | RLS-protected database |
| Private Buddy data | User-scoped protected data store |
| Code/project files | Local workspace and/or user-controlled private repository |
| Public portfolio | Explicit public projection |
| API/provider secrets | Keymaster-compatible encrypted custody boundary |
| Telemetry | Separate purpose-limited event store |
| Personal learning | User-private Mnemosyne zone |
| Generic OTHRYS learning | Sanitised evidence-derived knowledge |
| Admin/security events | Append-only audit evidence |

Git is not a privacy database.

Private conversations, behavioural telemetry, access secrets and erasable personal records must not be committed merely because Git is convenient.

---

## 9. Local-first and portability

OTHRYS should support storage drivers rather than one permanent storage monopoly.

Future user choice may include:

- This device
- OTHRYS private sync
- My Git provider
- approved future providers

The user should be able to export their project and account data in understandable formats.

Storage choice must not weaken the security policy. Local-first is not permission to put secrets into plaintext project folders.

---

## 10. Learning and telemetry doctrine

OTHRYS learns, but learning has walls.

```
USER ACTION
   |
PRIVATE EVENT
   |
PERSONAL LEARNING
   |
PRIVACY / SANITISATION GATE
   |
GENERIC LESSON
   |
GLOBAL OTHRYS KNOWLEDGE
```

### Personal learning
May use rich user context for that user's benefit.

### Operational telemetry
Measures reliability, latency, failures, cost, retries, model/provider behaviour and similar system facts. Prefer no content when a metric is enough.

### Product learning
Looks for UX/product patterns using minimised or pseudonymised events.

### Global OTHRYS knowledge
May receive only generic lessons that have passed privacy, provenance and evidence rules.

Private content must never flow into global learning merely because it produced a useful lesson.

Every learned personal fact should carry:
- provenance;
- confidence;
- first/last evidence time;
- scope;
- correction/forget control where applicable.

Single exploratory clicks are weak evidence. Repeated behaviour is stronger. Explicit user statements are strongest.

---

## 11. GDPR/privacy engineering law

Privacy is architecture, not a banner added at launch.

Every personal-data event must have:
- declared purpose;
- minimal fields;
- retention class;
- access class;
- learning eligibility;
- deletion/export behaviour.

Data collected for one purpose must not silently become training data for another.

Necessary security/operational logging and optional product analytics are separate systems and separate consent decisions where required.

OTHRYS should be able to answer:

- What do we store about this user?
- Why do we store it?
- Where is it?
- Who can access it?
- When is it deleted?
- Did it teach personal OTHRYS?
- Did any sanitised lesson reach global OTHRYS?

---

## 12. Keymaster and user API keys

Users may connect their own provider keys.

UX shows only sanitised metadata such as provider, status, masked suffix, scope and last-use time.

Raw values:
- enter a sealed Keymaster-compatible custody boundary;
- never return to the browser after submission;
- never enter logs, prompts, analytics, Mnemosyne, Git or portfolio artifacts;
- are never visible to ordinary ADMIN users.

Replacing/removing a key is explicit and audited.

---

## 13. Admin privacy / break-glass

Support must work without making private-content browsing routine.

Normal ADMIN tools should prefer:
- account state;
- product entitlement;
- error codes;
- sanitised traces;
- aggregate metrics;
- user-provided support attachments.

Private-content inspection requires break-glass:
1. reason;
2. target/scope;
3. recent strong authentication;
4. shortest useful time window;
5. audit record;
6. visible completion/expiry;
7. notification policy where appropriate.

Break-glass is exceptional evidence, not a hidden superpower.

---

## 14. Security UX

Security state must be understandable.

A user should be able to see:
- signed-in devices/sessions;
- passkeys/factors;
- recovery posture;
- recent security events;
- connected services;
- API-key status;
- export/delete controls.

Security warnings must state:
- what happened;
- what is at risk;
- what action is required;
- whether OTHRYS already contained the risk.

Never use fake urgency or vague red banners.

---

## 15. Design law

OTHRYS design remains:

**Powerful, calm, architectural.**

Additional USER laws:

- complexity is progressively disclosed;
- normal users never see architecture for architecture's sake;
- the Mountain is the default orientation point;
- empty/error/refused/stale are explicit states;
- unknown is a valid value;
- colour is never the only status signal;
- motion communicates hierarchy/state and respects reduced-motion;
- security controls use plain language;
- destructive operations show consequence before confirmation;
- public/private state is always visible.

---

## 16. Threat model baseline

Every USER/ADMIN/MASTER feature is reviewed against at least:

- credential theft/phishing;
- session theft/fixation;
- CSRF/cross-origin confusion;
- XSS and secret exfiltration;
- IDOR/BOLA;
- privilege escalation;
- stale-role/stale-token authority;
- malicious connected provider;
- compromised AI/agent acting with valid tools;
- prompt injection reaching tools;
- cross-user data leakage;
- insecure direct storage access;
- accidental publication;
- telemetry overcollection;
- support/admin abuse;
- supply-chain compromise;
- lost device/recovery abuse;
- destructive automation.

Aegis governs tool/action traversal. UX must never provide a path that bypasses Aegis merely because a human clicked a button.

---

## 17. Implementation sequence

### UX-01 — Identity foundation
Define USER / ADMIN / MASTER, capabilities, session classes and context boundaries.

### UX-02 — Jeroen dogfood identity
Create a genuine USER account distinct from operator privilege.

### UX-03 — USER shell
Mountain + prompt + Oro + Buddies + Workspace + Portfolio + Learning + Settings.

### UX-04 — Account/security center
Sessions, factors/passkeys, recovery, connections, data controls.

### UX-05 — Admin shell
Accounts, workspaces, entitlements, support, aggregate usage, incidents and audit.

### UX-06 — MASTER elevation
Short-lived step-up, hardware/passkey target, reason and audit.

### UX-07 — Storage/ownership
Storage-driver interface, export/delete and explicit publication.

### UX-08 — Learning/telemetry
Purpose-classified events, personal learning view, sanitisation gate and global-learning evidence.

### UX-09 — Break-glass support
Audited private-content escalation.

### UX-10 — Qualification
Threat-model tests, auth boundary tests, RLS tests, cross-account tests, security review and recovery drills.

---

## 18. Security release gates

No account architecture is production-ready until OTHRYS can prove:

1. USER A cannot read/write USER B data.
2. USER cannot reach ADMIN or MASTER APIs by URL manipulation.
3. ADMIN cannot self-promote.
4. ADMIN cannot read private content without a governed break-glass capability.
5. MASTER elevation expires and cannot be recreated from a USER session.
6. privileged cookies/tokens are not ambient across unrelated subdomains.
7. service-role/secret credentials never reach client bundles.
8. user-editable metadata grants no authority.
9. every exposed user table has appropriate RLS and ownership/scope policy.
10. Storage policies mirror database ownership boundaries.
11. publishing cannot leak known secret classes.
12. deletion/export paths have tests.
13. telemetry has purpose/retention classification.
14. personal learning does not silently become global knowledge.
15. agent/tool actions still traverse Aegis.
16. recovery works without a permanent backdoor.
17. security-relevant actions create audit evidence.
18. the interface never claims a security property that is not enforced underneath.

---

## 19. Canonical principle

> **OTHRYS SHOULD BE EASIER TO USE BECAUSE IT IS SECURE, NOT SECURE DESPITE BEING EASY TO USE.**

And:

> **THE BEST USER-FACING SECURITY FEATURE IS A SYSTEM THAT NEVER GIVES THE USER POWER THEY DID NOT ASK FOR, NEVER TAKES DATA IT DOES NOT NEED, AND CAN EXPLAIN EVERY EXCEPTION.**
