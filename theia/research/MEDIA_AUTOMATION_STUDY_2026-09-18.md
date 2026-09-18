# THEIA MEDIA AUTOMATION STUDY — 2026-09-18

**Status:** DATED RESEARCH DOSSIER — evidence for Theia/Hyperion decisions, not timeless law.

## 1. Research question

How can OTHRYS safely automate video/media production with low operator effort, preserve rights and originality, learn from audience response, and create commercially interesting assets without becoming a content farm?

Two initial production families:
1. clipping/repurposing;
2. automated animated/instructional media.

Two starter properties:
1. practical cartoon dad — utility/search-first;
2. Mipi the cat — character/IP-first.

---

## 2. Executive findings

1. **The highest-leverage automation target is 90–95% machine work plus a short human approval gate, not zero humans immediately.**
2. **Rights must be solved before scale.** Own/source-authorized media is structurally safer than random reposting.
3. **Recurring characters/templates are compatible with platform monetization only when each artifact has materially different substance and real value.**
4. **Clipping is easiest to validate commercially through authorized creator/client/campaign footage.**
5. **Animated explainers have a stronger long-term asset profile than clipping because they create original scripts, characters, visual systems and reusable IP.**
6. **A deterministic/programmatic renderer is strategically attractive after proof; SaaS is better for the first experiments.**
7. **Platform ad revenue should be a later channel, not the initial economic thesis.**
8. **The practical dad property is the faster cashflow/search experiment.**
9. **Mipi is the stronger IP/affection/licensing experiment.**
10. **Theia should be designed as an internal system that can later expose an API or white-label product.**

---

## 3. Clipping — commercial routes ranked by ease

### 3.1 Own-content repurposing

Rights risk: lowest.
Client acquisition: none.
Automation: very high.
Immediate revenue: indirect unless source business already monetizes.

Best for:
- OTHRYS long-form;
- product demos;
- webinars;
- podcasts;
- founder content.

Why it matters:
- safest training ground;
- produces acceptance/rejection data;
- tests toolchain before handling third parties.

### 3.2 Authorized creator/podcast repurposing service

Rights risk: low when contract is explicit.
Revenue clarity: high.
Recurrence: high.
Automation: high.

Productized offer shape:
- X source hours/month;
- Y approved shorts;
- captions/reframing included;
- one approval queue;
- optional scheduling;
- bounded revision count.

This is likely the strongest recurring low-touch clipping business.

Avoid becoming an editor-for-hire with unlimited subjective revisions.
Sell a defined result.

### 3.3 Licensed clipping campaigns / creator marketplaces

Rights risk: manageable when campaign terms explicitly supply licence.
Client acquisition: low.
Revenue volatility: high.
Platform dependence: high.

Good for:
- fast market testing;
- learning what kinds of clips get approved;
- economics experiments without sales calls.

Must record:
- campaign;
- source permission;
- allowed platforms;
- required tags/disclosures;
- payout model;
- caps;
- exclusions;
- approval state.

Never:
- buy/fake views;
- recycle rejected content deceptively;
- assume a campaign licence covers use outside campaign terms.

### 3.4 B2B webinar/training repurposing

Potentially attractive because businesses already possess source material and value distribution more than creator fame.

Candidate customers:
- training companies;
- SaaS;
- consultants;
- schools;
- conferences;
- agencies.

Outputs:
- internal micro-learning;
- LinkedIn/video snippets;
- customer education;
- event recap clips.

### 3.5 Random third-party repost clipping

Do not make this a core model.

Problems:
- copyright;
- reused-content rules;
- weak differentiation;
- platform enforcement;
- monetization fragility;
- no owned IP.

Crop + captions is not a durable moat.

---

## 4. Clipping — automation stack

### SaaS proof path

Use a mature clipping platform to test:
- candidate quality;
- reframing;
- captions;
- workflow;
- approval burden.

Current research examples:
- OpusClip-class tools;
- Vizard-class tools.

Evaluate:
- API;
- export rights;
- data retention;
- branding;
- language support;
- speaker tracking;
- publishing;
- cost/source hour;
- cost/approved clip.

### Local/owned path

Candidate stack:
- faster-whisper / WhisperX class transcription;
- word timestamps;
- pyannote-class diarization;
- LLM semantic segmentation;
- candidate score model;
- FFmpeg-class cutting/rendering;
- OpenCV/face/speaker tracking;
- ASS/subtitle renderer;
- Opsis state/approval;
- platform APIs.

Build only after SaaS experiments prove the economics or control requirement.

---

## 5. Clipping — low-effort target

Target operator flow:

    SOURCE ARRIVES
      -> machine creates candidates
      -> machine rejects obvious failures
      -> operator gets top 2–5 previews
      -> approve / reject / repair
      -> package/publish automatically

Track:
- review seconds/clip;
- repair minutes/clip;
- percent accepted unchanged;
- percent unusable;
- cost/approved clip.

Desired progression:
- first: <5 minutes human/clip;
- then: <2 minutes;
- later: review exceptions only for proven low-risk formats.

These are engineering goals, not guarantees.

---

## 6. Animated explainers — production routes

### 6.1 2D/cartoon SaaS

Best initial proof.

Advantages:
- character consistency;
- quick prototypes;
- scene libraries;
- low engineering work;
- predictable editing.

Current research example:
- Vyond-class platform with prompt/script/document-to-video and API direction.

Use it to answer:
- can the format be watchable?
- can the character feel original?
- how much manual repair remains?
- can 10–20 videos be produced without visual fatigue?

Do not build the renderer before answering those questions.

### 6.2 Programmatic video

Best strategic owned route after proof.

Current research example:
- Remotion-class React/programmatic rendering.

Advantages:
- deterministic;
- version-controlled;
- data-driven;
- batchable;
- reusable components;
- exact diagrams;
- stable characters/assets;
- easy derivative formats.

Candidate scene components:
- character dialogue;
- tool demo;
- cutaway diagram;
- label;
- timeline;
- map;
- comparison;
- step list;
- quiz;
- warning;
- recap.

### 6.3 Whiteboard/doodle

Strong automated educational format.

Advantages:
- cheap;
- clear;
- concept-first;
- easy voice synchronization;
- low character continuity burden.

Good for:
- science;
- finance basics;
- systems;
- history timelines;
- process explanations.

### 6.4 Generative video

Use selectively.

Strong:
- visual metaphor;
- special shot;
- establishing scene;
- hard-to-source background.

Weak as sole production engine when exactness matters:
- character continuity;
- tool/safety demonstrations;
- diagrams;
- repeatability;
- revisions.

---

## 7. Voice, captions and timing

Modern TTS can provide stable synthetic voices and timing data.

Strategic requirements:
- commercial rights;
- pronunciation controls;
- stable voice identity;
- exportable audio;
- replaceable provider.

Timing can drive:
- captions;
- mouth/pose changes;
- diagram reveals;
- scene transitions.

Current research example:
- ElevenLabs-class TTS.

Do not imitate a living public figure/creator voice without appropriate rights.

---

## 8. Platform policy findings

### YouTube

As of this study:
- original/authentic value is required for YPP;
- generic, repetitive and mass-produced content can be ineligible;
- recurring characters/series are allowed when each video has distinct substance/story/focus;
- AI-assisted creative work is not inherently disqualified;
- rights to commercial visual/audio elements are required.

Architectural consequence:
- reusable format is good;
- interchangeable episodes are bad;
- Mipi can recur;
- cartoon dad can recur;
- the intellectual payload must differ materially.

### TikTok

Creator Rewards rules, where available, emphasize:
- original;
- high quality;
- longer than one minute for qualifying videos.

Architectural consequence:
- 60–90 second explainers may be strategically more useful than ultra-short loops for some monetization tests;
- availability and current local rules must be refreshed before economic planning.

### General

Platform rules are external dependencies.
Theia must:
- preserve original files;
- preserve rights;
- preserve audience/analytics history;
- keep owned surfaces;
- avoid dependence on one platform's current algorithm/reward program.

---

## 9. Monetization — automated explainer routes

### 9.1 Productized B2B video

Potentially fastest direct cash route.

Input:
- document;
- URL;
- product page;
- training material.

Customer selects:
- audience;
- length;
- tone;
- brand;
- voice.

Output:
- one explainer;
- captions;
- derivatives.

Strong if:
- revisions are bounded;
- templates remain high quality;
- customer can self-serve.

### 9.2 Owned utility/search channel

Practical cartoon dad fits here.

Advantages:
- evergreen query demand;
- affiliate/sponsor fit;
- longer shelf life;
- problem-solution intent.

Potential money:
- ads later;
- disclosed affiliate;
- sponsors;
- checklists;
- product/brand partnerships;
- B2B licensed explainers.

### 9.3 Owned character/IP channel

Mipi fits here.

Advantages:
- affection;
- serial return;
- books;
- printables;
- educational packs;
- games;
- localization;
- licensing;
- merchandise after proof.

Slower to validate.
Potential ceiling is much larger if character affinity emerges.

### 9.4 Media feeding products

A strong OTHRYS route:
- explain concept;
- earn trust;
- route to useful Oros/tool when appropriate.

Commercial value may come from product adoption rather than media itself.

### 9.5 White-label/API

Long-term Theia opportunity:
- document -> video API;
- article -> animated explainer;
- webinar -> clip set;
- brand kit -> platform package.

This requires Opsis, stable contracts and strong provider abstraction.

---

## 10. Practical Cartoon Dad — thesis

Proven job:
people seek simple guidance on ordinary life tasks.

Existing successful human channels demonstrate demand for:
- ties;
- shaving;
- household fixes;
- tools;
- car basics;
- encouragement.

Theia thesis:
create a **distinct original cartoon property**, not a clone of an existing creator.

Differentiators worth testing:
- animated cutaways impossible in ordinary filming;
- multilingual versions;
- searchable structured task library;
- step cards/checklists;
- seasonal maintenance;
- consistent safety gates;
- short + long native package from one canonical lesson.

Commercial priority:
1. useful search audience;
2. repeat trust;
3. affiliate/sponsor fit where independent recommendation remains intact;
4. B2B/white-label.

---

## 11. Mipi — thesis

Mipi's contradiction:
- curiosity is maximum;
- energy expenditure is negotiable.

Why it is strong:
- inherently cat-like;
- conflict creates plot without forcing villainy;
- nap creates recognizable behavior;
- global animal appeal;
- easy visual comedy;
- works with geography/history/science/nature;
- strong book/game/merch optionality if proven.

Critical anti-slop rule:
do not make every episode:
"Mipi explores -> sleeps -> wakes -> answer."

The nap is a character system.
Story genomes must vary.

Promising tests:
- everyday-object mystery;
- historical place;
- animal/nature;
- folklore investigation;
- travel/culture.

Mipi should develop an audience before expensive lore/world-building.

---

## 12. Theia architecture recommendation

Phase 0 — doctrine
- Book of Theia;
- Opsis design;
- Arms;
- rights;
- quality;
- telemetry.

Phase 1 — manual/SaaS pilots
- 10–20 explainer tests;
- 20 clipping tests;
- Mipi pilots;
- cartoon dad pilots.

Phase 2 — operator approval console
- one preview queue;
- approve/reject/repair;
- production receipts.

Phase 3 — provider abstraction
- stable contracts;
- multiple vendor/local adapters.

Phase 4 — owned deterministic production
- programmatic video;
- owned character rigs;
- asset library;
- local clipping where justified.

Phase 5 — bounded autonomy
- low-risk templates auto-produce;
- human publish approval;
- later exception review.

Phase 6 — standalone option
- Theia API/Star/product;
- multi-Oros;
- white label.

---

## 13. Metrics that matter

### Media production
- cost/artifact;
- operator time;
- rework;
- QA failure;
- render/provider failure;
- rights incidents.

### Audience
- CTR/stop;
- first-seconds retention;
- completion;
- rewatch;
- saves;
- shares;
- return.

### Property
- recurring viewers;
- queries for more;
- character affinity;
- evergreen traffic;
- derivative performance.

### Commercial — interpreted by Hyperion
- cost/qualified audience action;
- affiliate/sponsor/product intent;
- client acquisition cost;
- gross margin;
- support burden;
- recurrence;
- platform concentration risk.

---

## 14. Recommended first experiments

### Experiment A — clipping
- authorized footage only;
- 20 published clips;
- SaaS first;
- track operator minutes;
- no custom engineering until pain is quantified.

### Experiment B — practical dad
- 5 low-risk tasks;
- each with one 3–6 minute version + 1–2 shorts;
- test cartoon visual grammar;
- measure search/retention/saves.

### Experiment C — Mipi
- 5–10 distinct short adventures;
- 2–3 longer episodes;
- test 1–2 visual styles;
- no deep lore yet;
- measure character affinity and return.

### Decision after bounded batch
- kill;
- revise;
- increase quality;
- change audience/format;
- build owned renderer;
- or prepare commercial route.

---

## 15. External references checked

Mythology:
- Theoi — Theia: https://www.theoi.com/Titan/TitanisTheia.html
- Theoi — Hesiod Theogony: https://www.theoi.com/Text/HesiodTheogony.html
- Theoi — Helios: https://www.theoi.com/Titan/Helios.html
- Theoi — Selene: https://www.theoi.com/Titan/Selene.html
- Theoi — Eos: https://www.theoi.com/Titan/Eos.html

Platform policy:
- YouTube Channel Monetization Policies: https://support.google.com/youtube/answer/1311392
- YouTube monetizable content/rights: https://support.google.com/youtube/answer/2490020
- YouTube spam policy: https://support.google.com/youtube/answer/2801973
- YouTube YPP overview: https://support.google.com/youtube/answer/72851
- TikTok Creator Rewards support: https://support.tiktok.com/en/business-and-creator/creator-rewards-program/

Current tool research examples:
- Remotion: https://www.remotion.dev/
- Vyond API help: https://help.vyond.com/hc/en-us/articles/51873650828052-How-do-I-use-the-Vyond-API
- Vyond Go: https://help.vyond.com/hc/en-us/articles/17215758029460-Using-Vyond-Go-Text-to-video
- ElevenLabs TTS API: https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- OpusClip API: https://www.opus.pro/api
- Vizard API docs: https://docs.vizard.ai/docs/introduction

These links are dated research evidence. Recheck before implementation or commercial reliance.

---

## 16. Final study verdict

The technically easiest money is not "AI YouTube automation."

It is:
- lawful source;
- clear job;
- repeatable production;
- tiny approval burden;
- useful artifact;
- diversified distribution;
- owned assets;
- Hyperion-controlled commercial opening.

Theia should be built to make **good media cheap**, not **cheap media abundant**.
