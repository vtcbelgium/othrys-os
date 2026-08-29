# V2-010V Preflight — Switchyard House Admission

**Status:** RUNNING / ADMISSION-ONLY

V2-010U already proved the resolver. This mission must not change selection behavior. It admits Switchyard into the current House by updating the same canonical surfaces used for every resident: `.othrys/project.json`, `books/BOOK_REGISTRY.json`, one Book, one component contract, and the anti-drift tests that currently still classify Switchyard as quarry-only.

Atlas and Mnemosyne should pick the new resident up through their existing derived projections; no second registry, cache, provider-health store or Panda backend may be created.

The obsolete quarry-only exception may be removed for `switchyard` only. `prometheus`, `rhea`, and `visual-control` remain gated.
