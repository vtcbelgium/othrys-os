# BOOK OF CARTOON PRODUCTION

## OTHRYS / THEIA — scripted animation production doctrine

**Status:** ACTIVE THEIA SPECIALIZATION — scripted animation production doctrine.  
**Parent surfaces:** Story Forge + Media Factory.  
**Reference property:** Pemberton.  
**Authority:** this Book specializes Theia media production; it does not bypass Trust Canal or duplicate Hephaestus, Talos, Mnemosyne, Hyperion or other OTHRYS responsibilities.

> **THE CARTOON IS BUILT SHOT BY SHOT. THE PROPERTY IS BUILT MEMORY BY MEMORY.**

---

# 0. PURPOSE

This Book answers one practical question:

> **How does OTHRYS repeatedly turn a story property into a coherent, watchable, affordable cartoon without degrading into inconsistent AI slop?**

The cartoon pipeline must optimize for:
- character consistency;
- visual readability;
- timing;
- reusable assets;
- controllable motion;
- rights/provenance;
- low marginal cost;
- international reach;
- human creative judgment;
- measurable audience learning.

The reference implementation is Pemberton, but the production system must generalize.

This Book does not replace:
- `BOOK_OF_STORY_FORGE.md`;
- `BOOK_OF_MEDIA_FACTORY.md`;
- Distributor;
- Vault;
- Prometheus;
- Mnemosyne;
- Hephaestus;
- Talos;
- Switchyard;
- Trust Canal.

---

# 1. FIRST LAW — DO NOT PROMPT A SIX-MINUTE CARTOON

Never ask a generative model:

> "Make a six-minute Pemberton episode."

A real episode is decomposed:

```text
PROPERTY CANON
→ SEASON ARC
→ EPISODE PREMISE
→ BEAT SHEET
→ SCRIPT
→ SHOT LIST
→ STORYBOARD
→ SCRATCH AUDIO
→ ANIMATIC
→ APPROVED KEYFRAMES
→ MOTION SHOTS
→ COMPOSITE
→ EDIT
→ MASTER
→ DERIVATIVES
→ PUBLISH
→ AUDIENCE EVIDENCE
```

Generation operates at bounded stages.

This allows:
- correction;
- continuity;
- selective regeneration;
- cost control;
- provenance;
- style discipline.

> **GENERATE THE SHOT. NEVER REGENERATE THE WHOLE WORLD BECAUSE ONE PAW IS WRONG.**

---

# 2. PRODUCTION PHILOSOPHY

Animation does not need maximum movement.

It needs intentional movement.

A strong cartoon may hold:
- a stare;
- a blink;
- an ear twitch;
- a slow paw;
- a reaction;
- a perfectly timed stillness.

For Pemberton specifically, stillness is character.

A two-second Processing Stare may be funnier than twenty camera cuts.

The factory therefore distinguishes:

## MOTION THAT EARNS COST
- character acting;
- important physical comedy;
- travel;
- transformation;
- chase;
- reveal;
- emotional action.

## MOTION THAT DOES NOT NEED GENERATION
- camera hold;
- blink;
- tail flick;
- ear movement;
- background loop;
- slight breathing;
- pose-to-pose transition;
- object insert;
- still reaction.

Use the cheapest reliable technique that produces the intended result.

---

# 3. THE HYBRID CARTOON MODEL

Do not commit the property to one generation technology.

The preferred architecture is hybrid.

```text
2D DESIGN / PAINT
+
3D REUSABLE GEOMETRY
+
GENERATIVE IMAGE
+
GENERATIVE VIDEO
+
CLASSICAL EDITING / COMPOSITING
+
SOUND / MUSIC
```

Different shots route differently.

## ROUTE A — STATIC / LIMITED ANIMATION

Best for:
- reaction shots;
- Spa;
- close-ups;
- map inserts;
- still comedy;
- dialogue-free thought beats.

Tools:
- Krita;
- Blender/Grease Pencil;
- simple transforms;
- frame interpolation where justified.

## ROUTE B — REUSABLE 3D

Best for:
- Pemberton House;
- Grand Tour Door;
- Motor Carriage/Chariot;
- Atlas;
- recurring furniture;
- repeatable camera geometry.

Tools:
- Blender;
- rigged reusable assets;
- generated paint-over if needed.

## ROUTE C — IMAGE-TO-VIDEO

Best for:
- approved Pemberton hero frame;
- environment motion;
- controlled character movement;
- short set pieces.

Primary local candidate:
- Wan2.2 TI2V/I2V through ComfyUI.

## ROUTE D — CONTROLLED VIDEO / REFERENCE VIDEO

Best for:
- motion transfer;
- pose reference;
- difficult body acting;
- scene repair;
- masked edits.

Candidates:
- VACE;
- Wan animation/reference workflows;
- video-to-video pipelines.

## ROUTE E — LONG EXPERIMENTAL GENERATION

Best for:
- atmosphere;
- unusual travel inserts;
- exploratory motion;
- long background action.

Candidate:
- FramePack.

The router chooses the route.

The property never depends on one vendor.

---

# 4. FREE / LOCAL-FIRST REFERENCE STACK

As of September 2026, the strongest low-cost foundation is local.

## COMFYUI

Role:
- graph-based model orchestration;
- saved workflows;
- local API;
- image/video/audio model integration;
- reproducible seeds and parameters.

ComfyUI supports reusable node graphs, local API integration, model offloading, quantized models, image/video workflows and fully offline operation when API nodes are disabled.

Source:
https://github.com/Comfy-Org/ComfyUI

## WAN2.2

Role:
- primary local image-to-video / text-image-to-video motion engine.

Use for:
- approved storyboard/keyframe → moving shot.

Source:
https://github.com/Wan-Video/Wan2.2

The model family is suitable for local production experiments and supports image/video generation workflows through ComfyUI.

## VACE

Role:
- reference-to-video;
- video-to-video;
- masked video editing;
- controlled repair and animation.

Useful when a clean keyframe exists but exact motion or local correction is difficult.

Source:
https://github.com/ali-vilab/VACE

## FRAMEPACK

Role:
- long-form/experimental local video generation with aggressive memory management.

Official requirements state support for RTX 30/40/50-series hardware with as little as 6 GB VRAM for its supported workflows.

Source:
https://github.com/hiranuma/framepack

Use as a specialist tool, not the default for every shot.

## KRITA + AI DIFFUSION

Role:
- approved keyframe production;
- paint-over;
- inpainting;
- corrections;
- pose/depth/reference guidance.

The Krita AI Diffusion plugin can connect to ComfyUI and use ControlNet/IP-Adapter/inpainting-style workflows.

Source:
https://github.com/Acly/krita-ai-diffusion

## BLENDER

Role:
- reusable environments;
- Chariot;
- camera/blocking;
- depth/normal guides;
- simple animation;
- Grease Pencil;
- repeatable transformations.

Blender should hold geometry that benefits from exact consistency.

## KDENLIVE / FFMPEG

Role:
- editorial;
- compositing;
- subtitles;
- timing;
- final assembly;
- automated render preparation.

Kdenlive is free/open-source with no premium unlock tier.

Source:
https://kdenlive.org/

## KOKORO

Role:
- scratch narration or temporary voice during animatic tests.

Kokoro-82M is Apache-2.0 licensed and lightweight.

Source:
https://huggingface.co/hexgrad/Kokoro-82M

For a near-mute property, TTS becomes optional rather than foundational.

---

# 5. HARDWARE STRATEGY

The local GPU is the default render worker when quality is sufficient.

Cloud generation is escalation.

```text
LOCAL CHEAP SHOT
→ LOCAL CONTROLLED RETRY
→ LOCAL SPECIALIST MODEL
→ CLOUD HERO-SHOT ESCALATION
```

Never invert this into:

```text
CLOUD EVERYTHING
→ credits exhausted
→ no reproducible pipeline
```

Theia/Media Factory should record:
- model;
- model version;
- workflow version;
- seed;
- source frame;
- source asset versions;
- render settings;
- elapsed time;
- hardware;
- selected output;
- rejected outputs.

---

# 6. CHARACTER CONSISTENCY STRATEGY

Character consistency is a property problem, not merely a prompt problem.

Pemberton requires a **Character Identity Pack**.

At minimum:

- front;
- 3/4 front;
- profile;
- 3/4 rear;
- rear;
- top;
- loaf;
- Royal Sit;
- walk;
- crouch;
- jump;
- stretch;
- Processing Stare;
- Dignity Reset;
- Spa collapse;
- paw close-up;
- face close-up;
- collar/bow details;
- exact tuxedo markings;
- eye shape;
- body proportions.

The pack becomes reference material for:
- image generation;
- LoRA training if warranted;
- IP-Adapter/reference conditioning;
- human correction;
- QA comparison.

The model does not get permission to redesign Pemberton every shot.

---

# 7. BACKGROUND CONSISTENCY

Recurring locations become assets.

Pemberton House:
- floor plan;
- major camera zones;
- sofa;
- Grand Tour Door;
- Catering;
- Sanitation;
- Carriage House;
- Spa;
- windows;
- lighting states.

A recurring environment should ideally have:
- 3D blockout;
- approved style frames;
- reusable camera coordinates;
- depth maps;
- prop identifiers.

This reduces generative hallucination.

The more often a set returns, the more deterministic it should become.

---

# 8. CHARIOT PRODUCTION

The Motor Carriage / Chariot is an ideal 3D-first asset.

Why:
- geometric;
- recurring;
- transforms;
- moves through perspective;
- appears beside Pemberton frequently;
- must remain consistent.

Create:
- C0 Home;
- C1 Terrain;
- C2 Glider;
- C3 Skiff;
- C4 Sled.

Rig:
- wheels/tracks;
- body;
- transform parts;
- rotors/vanes;
- lights where needed.

Then:
- render directly;
- composite into generated backgrounds;
- use as depth/motion reference;
- paint-over for a more illustrated look.

Do not regenerate Chariot from scratch in every frame.

---

# 9. VISUAL-FIRST / NEAR-MUTE CARTOON DOCTRINE

## RECOMMENDED DIRECTION

For Pemberton, the strongest current creative hypothesis is:

> **NO HUMAN-LANGUAGE DIALOGUE FROM PEMBERTON. LITTLE OR NO INTERNAL NARRATION. VISUAL-FIRST STORYTELLING.**

This is not the same as literal silence.

Pemberton may produce:
- mrrp;
- chirp;
- purr;
- hiss;
- growl;
- tiny grumble;
- breath;
- startled cat sounds.

Humans may speak sparingly where needed, but the story must not depend on understanding long dialogue.

This approach is closer to **Mr Bean / Shaun the Sheep visual comedy** than to a conventional narrated cartoon.

Official Mr Bean material describes its animated form as using little dialogue and identifies visual comedy as core to the character.

Aardman explicitly notes that dialogue-free storytelling can cross language barriers, and describes Shaun the Sheep as warm, witty visual storytelling intended to entertain all ages.

References:
- https://shop.mrbean.com/pages/about-us
- https://www.aardman.com/latest-news/2023/february/save-the-children-home-short-film/
- https://www.aardman.com/latest-news/2025/may/aardman-and-bbc-launch-new-series-of-shaun-the-sheep

---

# 10. WHY NEAR-MUTE FITS PEMBERTON

Pemberton's funniest information is already physical.

He communicates:
- entitlement through posture;
- disgust through one paw;
- curiosity through ears/eyes;
- judgment through stillness;
- panic through launch velocity;
- affection through whiskers/purr/contact;
- laziness through refusal;
- confidence through impossible ledge behavior;
- humiliation through Dignity Reset.

Narration risks explaining the joke after the animation already told it.

A visual-first Pemberton has several advantages.

## INTERNATIONAL

No heavy dubbing.

Children anywhere can follow the physical story.

Adults can read the second layer through context.

## PRODUCTION

No lip sync.

Less voice-generation dependency.

Less dialogue timing.

More reuse of shots across languages.

## CHARACTER

More cat-like.

Less "human man inside cat body."

## COMEDY

Silence creates timing.

The stare becomes funnier.

The pause becomes meaningful.

## SOPHISTICATION

The adult layer moves into:
- props;
- signs;
- visual framing;
- architecture;
- background behavior;
- bureaucratic labels;
- Pemberton's rituals;
- ironic contrasts;
- classical/music cues.

Sophistication does not require spoken cleverness.

---

# 11. SOPHISTICATED MUTE HUMOR

Mute does not mean preschool simplicity.

Adult-readable humor can live in the image.

Examples:

## CATERING FAILURE

Child:
food did not come out.

Adult:
Pemberton sits beneath a tiny framed plaque reading "CATERING" while a maintenance light flashes.

He waits.

Checks imaginary service standard.

Looks at Staff.

Looks back.

No dialogue required.

## TRAVEL LUXURY

Child:
Pemberton dislikes rough accommodation.

Adult:
he unfolds one pristine napkin in a collapsing ancient chamber before sitting.

## MANAGEMENT

Child:
robot vacuum ignores Pemberton.

Adult:
Pemberton sits in Royal Sit beside charging dock while Chariot docks itself, visually resembling an executive waiting for an employee disciplinary hearing.

## MUSEUM

Child:
he wants shiny object.

Adult:
he removes himself from a public display area and sits beside an "DO NOT TOUCH" sign while staring at a visitor touching glass.

## SPA

Child:
cute cat melts.

Adult:
after surviving Antarctica, Pemberton becomes completely incapacitated by one thumb on a toe bean.

No spoken punchline improves this.

---

# 12. VISUAL LANGUAGE FOR NEAR-MUTE STORYTELLING

Every episode should be readable through five channels.

## 1. BODY

Pose.

Weight.

Speed.

Stillness.

## 2. EYES / EARS / TAIL

Fine emotion.

## 3. OBJECTS

Props carry meaning.

## 4. SPACE

Where characters stand tells the joke.

## 5. SOUND / MUSIC

Rhythm clarifies intention.

Dialogue becomes optional.

---

# 13. MUSIC AS NARRATOR

In a near-mute series, music becomes a storytelling voice.

Pemberton should have motifs.

Possible musical families:

## PEMBERTON DIGNITY
small elegant chamber motif.

## CAT BRAIN
plucked/quick motif when instinct overrides aristocrat.

## CHARIOT
mechanical rolling motif.

## GRAND TOUR
adventure motif.

## COLLECTOR
subtle unresolved motif.

## SPA
warm stripped-down variation of Pemberton theme.

Music must support the joke, not constantly tell the viewer what to feel.

Silence remains a valid music choice.

---

# 14. SOUND DESIGN

Near-mute increases sound importance.

Create a canonical SFX library for:
- paws on wood;
- paws on stone;
- claws;
- collar/bow;
- Chariot wheels;
- Chariot docking;
- portal;
- Atlas;
- litter robot;
- feeder;
- spray bottle;
- purr;
- chirp;
- grumble;
- tail impact;
- jump/landing.

Good sound makes limited animation feel more alive.

---

# 15. TEXT ON SCREEN

Use sparingly.

Text can create adult-layer humor without making the cartoon dialogue-heavy.

Examples:
- museum sign;
- hotel sign;
- warning notice;
- "CATERING";
- "STAFF ONLY";
- "DO NOT TOUCH";
- broken service display;
- expedition labels.

Rules:
- child comprehension must not depend on reading;
- adult joke may reward readers;
- do not overload the frame;
- localize text when needed;
- symbolic signage is preferred where practical.

---

# 16. HUMAN SPEECH

Humans may speak.

But Pemberton's comprehension should be contextual.

The audience should not need long human dialogue.

Staff can say:
- "No.";
- "Pemberton!";
- affectionate fragments;
- practical household speech.

Most human communication can remain muffled, partial or off-frame.

This preserves cat POV.

---

# 17. NEAR-MUTE PILOT TEST

Do not decide the final audio doctrine theoretically.

Make two versions of the same 45–60 second test.

## VERSION A — NEAR-MUTE
- cat vocalizations;
- music;
- SFX;
- no internal narration.

## VERSION B — LIGHT NARRATION
- same visuals;
- sparse Pemberton internal lines.

Blind compare:
- comprehension;
- humor;
- sophistication;
- charm;
- replay value;
- international readability;
- production complexity.

Preferred hypothesis:

**Version A should win unless narration adds meaning the visuals genuinely cannot carry.**

Narration becomes an exception tool, not default infrastructure.

---

# 18. SCRIPTING A NEAR-MUTE CARTOON

A script must describe observable behavior.

Bad:

"Pemberton realizes the Collector has been following him and becomes suspicious."

Better:

"Pemberton sees a fresh bootprint beside the Atlas seal. He places one paw inside it. Looks at his paw. Looks at the bootprint. Ears narrow. He scratches the print away, then sits facing the corridor."

The second version can be storyboarded.

The first cannot.

---

# 19. NEAR-MUTE SCRIPT FORMAT

Every beat should contain:

```text
OBJECTIVE
VISIBLE ACTION
REACTION
INFORMATION CHANGE
COMEDY
SOUND
MUSIC
OPTIONAL TEXT
```

Dialogue is not a mandatory field.

A silent script is more dependent on exact staging.

---

# 20. ACTING REFERENCE

For complex shots, record live-action reference.

Human performers can act:
- timing;
- glance direction;
- surprise;
- anticipation;
- weight shift;
- chase rhythm.

Then translate to feline anatomy rather than copying human gestures literally.

Reference video may guide:
- animator;
- Blender blocking;
- Wan/VACE motion workflows.

The animation remains cat-specific.

---

# 21. STORYBOARD QUALITY GATE

A near-mute storyboard must pass the **Mute Test**:

> **Can a viewer understand the main physical story with the audio off?**

Then pass the **Sound Test**:

> **Does audio make it richer rather than make it finally understandable?**

Then pass the **Adult Layer Test**:

> **Is there something an adult can notice that a child does not need in order to follow the plot?**

---

# 22. SHOT DURATION

Do not optimize to constant cutting.

Recommended logic:

Short shots:
- surprise;
- impact;
- chase;
- reveal.

Longer holds:
- Processing Stare;
- Spa;
- ledge gag;
- anticipation;
- awkward social situation;
- visual irony.

The timing itself is comedy.

---

# 23. ANIMATIC FIRST

The animatic is the primary quality gate.

A near-mute property benefits even more because:
- timing becomes visible;
- unclear staging is obvious;
- excessive exposition cannot hide bad storytelling;
- audio can be tested separately;
- expensive generation can remain deferred.

The animatic may use still storyboard frames.

Do not generate final motion to discover whether the story works.

---

# 24. SHOT GENERATION CONTRACT

Each motion shot receives:

```text
shot_id
source_frame
end_frame_if_any
duration
camera_lock
character_reference
motion_reference
pose_start
pose_end
environment_reference
required_action
forbidden_drift
continuity_in
continuity_out
model_route
workflow_version
seed
render_budget
retry_budget
review_state
```

Forbidden drift examples:
- tuxedo markings change;
- extra limb;
- Chariot geometry changes;
- bow disappears;
- scale changes;
- eye color changes;
- background door moves;
- Pemberton becomes anthropomorphic;
- humanlike hand gesture appears.

---

# 25. MOTION ROUTER

Pseudo-policy:

```text
IF shot is mostly hold/reaction
  → limited animation / 2D

ELSE IF recurring rigid object dominates
  → Blender

ELSE IF approved keyframe + modest motion
  → Wan2.2 image-to-video

ELSE IF exact motion/reference needed
  → VACE / reference workflow

ELSE IF long atmospheric experimental movement
  → FramePack candidate

IF local result repeatedly fails and shot is important
  → cloud escalation candidate

IF shot is not narratively important
  → simplify rather than spend
```

---

# 26. CLOUD ESCALATION

Cloud models are specialist vendors, not the foundation.

Use when:
- hero shot;
- difficult transformation;
- local model fails;
- benchmark comparison;
- exceptional visual quality materially changes result.

Do not use paid generation because it feels easier during development.

Record:
- cost;
- provider;
- terms;
- model;
- prompt;
- source media;
- output rights;
- selected version.

---

# 27. CARTOON QA

Before master lock:

## STORY
- clear;
- complete;
- no missing causal beat.

## CHARACTER
- on-model;
- correct behavior;
- feline embodiment preserved.

## CONTINUITY
- props;
- markings;
- Chariot mode;
- geography;
- Atlas state;
- damage.

## VISUAL
- broken anatomy;
- flicker;
- morphing;
- object drift;
- frame artifacts.

## AUDIO
- purr/music/SFX balance;
- no accidental clipping;
- no licensed asset ambiguity.

## RIGHTS
- every material dependency known.

## PLATFORM
- aspect;
- captions;
- thumbnail;
- title;
- audience classification;
- master codec.

---

# 28. DERIVATIVE PRODUCTION

One episode can yield:

- main 16:9 episode;
- hook Short;
- character Short;
- Spa Short;
- Chariot Short;
- stills;
- GIF/loop;
- thumbnail candidates;
- poster frame;
- social vertical;
- silent/autoplay-safe clip.

Near-mute production increases derivative reuse because dialogue is not tied tightly to one language or crop.

---

# 29. INTERNATIONALIZATION ADVANTAGE

Near-mute animation provides structural localization savings.

Localize:
- title;
- metadata;
- subtitles for human fragments;
- on-screen signs where materially important.

Do not dub every Pemberton episode simply to make it understandable.

This supports broad distribution while preserving one canonical performance.

---

# 30. SOPHISTICATION LAW

Do not mistake verbal complexity for sophistication.

Sophistication may come from:
- visual metaphor;
- mise-en-scène;
- historical detail;
- architecture;
- behavioral accuracy;
- timing;
- irony;
- adult recognition;
- music;
- recurring motifs;
- restraint;
- narrative payoff.

A child can laugh because Pemberton falls into a basket.

An adult can laugh because he then remains in the basket and silently expects transportation.

Same shot.

Two audiences.

---

# 31. MR BEAN / SHAUN LESSON

The relevant lesson is not imitation.

It is structural.

## MR BEAN
- minimal dialogue;
- behavior-driven comedy;
- objects become problems;
- social rules create humor;
- expression carries intention.

## SHAUN THE SHEEP
- visual storytelling;
- little/no dialogue dependence;
- strong silhouettes;
- physical objectives;
- cross-generational humor;
- international portability.

Harvest:
- visual clarity;
- timing;
- object comedy;
- character intention;
- sparse vocalization.

Do not copy:
- character designs;
- scene premises;
- signatures;
- exact gags;
- visual identity.

---

# 32. PEMBERTON AUDIO RECOMMENDATION

Current recommended development direction:

# VISUAL-FIRST NEAR-MUTE

Pemberton:
- never speaks human language aloud;
- uses authentic/stylized cat vocalizations;
- preferably has no routine internal narration;
- may receive extremely rare narration only if a future test proves it adds unique value.

Staff:
- sparse natural human fragments.

The series:
- communicates plot visually;
- communicates sophistication through staging;
- uses music and SFX as narrative instruments.

This is a **production hypothesis until pilot comparison confirms it**.

If adopted as property canon, update `BOOK_OF_PEMBERTON.md` to replace the current permissive internal-narration rule.

---

# 33. PILOT PROGRAM

Before a full episode:

## TEST A — FOOD DISPENSER
30–45 sec.

Tests:
- mute comprehension;
- expression;
- domestic comedy.

## TEST B — SPA
30–45 sec.

Tests:
- emotional charm;
- subtle animation;
- purr/sound design.

## TEST C — CHARIOT
30–45 sec.

Tests:
- recurring rigid asset;
- 3D/2D composite;
- silent double act.

## TEST D — GRAND TOUR
45–60 sec.

Tests:
- portal;
- new environment;
- Pemberton consistency;
- Wan/VACE route;
- world-edge behavior.

## TEST E — SAME SCENE A/B
Near-mute versus sparse internal narration.

No full-season production before these tests reveal the production bottleneck.

---

# 34. OTHRYS INTEGRATION

Current responsibility split remains:

## STORY FORGE
Story architecture, canon profile, continuity, script.

## MEDIA FACTORY
Storyboard, animatic, assets, motion, edit, derivatives.

## PROMETHEUS
External production/tool research and factual reference.

## MNEMOSYNE
Durable institutional knowledge.

## ATLAS
Derived read-only relationship view.

## HEPHAESTUS
Build missing production tooling.

## TALOS
Verify objective production claims.

## TRUST CANAL
Control progression/authority.

## SWITCHYARD
Select approved model/capability labor.

## KEYMASTER
Credential custody.

## MYCELIUM
Route eligible workloads.

## KRONOS / RHEA
Lifecycle and system vitality.

## HERMES
Communication/event evidence.

## HYPERION
Economic thesis, distribution intelligence, scale/kill decisions.

## HUMAN
Taste, humor, canon acceptance, final master approval.

Theia is the active creative-production Titan. Opsis coordinates production state while the other OTHRYS systems retain their own authority boundaries.

---

# 35. AUTOMATION TARGET

The final automation should not be:

`PROMPT -> CARTOON`

It should be:

```text
APPROVED CANON
→ STRUCTURED STORY
→ STRUCTURED SHOTS
→ APPROVED STORYBOARD
→ ANIMATIC
→ SHOT ROUTER
→ REPEATABLE GENERATION WORKFLOWS
→ QA
→ HUMAN MASTER LOCK
→ DERIVATIVE FACTORY
→ AUDIENCE EVIDENCE
```

Automation removes repetitive labor.

It does not remove taste.

---

# 36. FINAL LAWS

> **MAKE THE STORY WORK BEFORE MAKING THE FRAMES EXPENSIVE.**

> **A STILL FRAME WITH PERFECT TIMING CAN OUTPERFORM FIVE SECONDS OF GENERATIVE CHAOS.**

> **REUSE ASSETS. DO NOT REUSE STORIES.**

> **LOCAL FIRST. CLOUD WHEN THE SHOT EARNS IT.**

> **CHARACTER CONSISTENCY IS A SYSTEM, NOT A PROMPT.**

> **MUTE DOES NOT MEAN SIMPLE.**

> **VISUAL COMEDY CAN BE MORE SOPHISTICATED BECAUSE IT REFUSES TO EXPLAIN ITSELF.**

> **IF THE VIEWER NEEDS THE NARRATOR TO UNDERSTAND THE ACTION, FIX THE STORYBOARD.**

> **THE BEST PEMBERTON JOKE MAY BE ONE LOOK, ONE PAW, AND TWO SECONDS OF SILENCE.**

> **THE FACTORY SHOULD MAKE CARE CHEAPER, NOT CARE OPTIONAL.**
