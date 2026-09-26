# Component Contract: Book of UX / Identity Boundary

**ID:** `ux-identity`
**Book:** `books/book-of-ux/README.md`
**Owner:** `GPT_CONTROL`
**Purpose:** Define the human-facing USER / ADMIN / MASTER trust model, progressive UX disclosure, account/data ownership, learning/privacy boundary and security release gates.
**Inputs:** authenticated identity evidence; server-controlled capability facts; Oro/workspace ownership; product entitlements; privacy/consent state; sanitised system status.
**Outputs:** authorised user/admin/master projections; explicit denial/elevation flows; publication/data-control intent; audit evidence.
**Dependencies:** Aegis action traversal; Keymaster secret custody; Mnemosyne provenance/learning zones; Supabase/Auth implementation where used; per-product Buddy/Oro contracts.
**Allowed touch:** UX doctrine, identity/capability contracts, read/write intent definitions, security requirements, privacy/telemetry classes, progressive disclosure.
**Forbidden touch:** self-grant of authority; raw secret storage; bypass of Aegis; UI-only authorisation; silent publication; silent global learning from private content; permanent MASTER sessions; routine admin browsing of private user content.
**Authority:** NO_SELF_GRANT — this contract defines required boundaries but grants no runtime authority.
**Evidence:** docs/product/WEBSITE-SKELETON-v0.md in othrys-web; existing owner allowlist/auth boundary; Study Buddy owner-scoped RLS; Book of Keymaster; Book of Mnemosyne; this Book.

## Loop contract
- OWNER: `GPT_CONTROL`
- TRIGGER: UX/account/auth/product-surface design or change
- INPUT: user job + identity + capability + data/privacy class
- STATE: deny-by-default; private-by-default; publication explicit; learning provenance retained
- BUDGET: expose only the minimum capability/data required for the current human job
- EXIT CONDITION: authorised projection/action, explicit elevation request, or fail-closed denial
- EVIDENCE: boundary tests + RLS/storage tests + security review + audit evidence for consequential actions
- STALL/FAILURE: ambiguous identity, stale/unknown capability, missing privacy purpose, secret-bearing projection, cross-user scope, ungoverned elevation or Aegis bypass fails closed
