# OPSIS

**Status:** ACTIVE THEIA CONTROL PLANE — documented production surface.  
**Parent Titan:** Theia

Opsis is the media-production control plane inside Theia.

It does not replace Story Forge, Media Factory, Mnemosyne, Talos, Trust Canal or human approval.

## Production graph

```text
PROPERTY
  -> SEASON
    -> EPISODE
      -> SCENE
        -> BEAT
          -> SHOT
            -> ASSET
              -> VERSION
                -> RECEIPT
```

Opsis tracks creative state, locks, shot timing, asset dependencies, provenance, rights state, model/tool/workflow receipts, continuity, derivative relationships, release packages and audience evidence mapped back to creative units.

Recommended human locks:
- PROPERTY CANON;
- STORY/SEASON;
- SCRIPT;
- CHARACTER DESIGN;
- ANIMATIC;
- MASTER;
- PUBLISH APPROVAL.

Opsis records locks. It does not grant authority around Trust Canal.

> **OPSIS KEEPS THE THREAD.**
