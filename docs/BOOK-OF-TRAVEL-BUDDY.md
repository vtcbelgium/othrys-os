# The Book of Travel Buddy

**Status:** Canonical product doctrine / living book  
**Field Trial:** Portugal 2026 — Field Trial 001  
**Owner:** OTHRYS  
**Last major harvest:** 2026-09-13

> Travel Buddy is not an itinerary generator. It is a stateful travel companion that helps a traveller prepare, move, decide, understand, remember and share — while knowing when to stay quiet.

---

## 1. Why Travel Buddy Exists

Travel information is abundant but fragmented. A traveller moves between airline sites, hotel apps, maps, transport operators, blogs, social media, museum guides, booking platforms, notes, photos, messages and memory. Most products solve one slice. Travel Buddy should maintain the trip as a living state and bring the right information forward at the right moment.

The product starts with a domain the owner knows through extensive real travel. Portugal 2026 is not a hypothetical persona exercise: it is the first hard real-time field trial, with changing plans, buses, trains, hotels, heat, fatigue, food, museums, archaeological sites, opening hours, photos, mistakes, corrections, collections, stamps, costs and spontaneous discoveries.

The foundational product principle is therefore:

**Build from observed travel reality, not imagined travel UX.**

---

## 2. Product Ladder — Basics Before Intelligence

Travel Buddy must resist the temptation to begin with clever AI frills. The basic travel layer is already a substantial product.

### Layer A — Travel Fundamentals

A trustworthy handbook and checklist engine covering, at minimum:

- choosing, comparing and booking flights;
- airports, check-in, boarding, security, connections and arrival;
- passports, visas, travel documents and copies;
- choosing and booking accommodation;
- check-in/check-out, deposits, city taxes and bag drops;
- rail, bus, metro, taxi/rideshare, ferries and rental transport;
- luggage rules, cabin baggage, checked baggage and day bags;
- luggage storage and station-locker alternatives;
- money, cards, cash, exchange, ATMs and common fee traps;
- mobile connectivity, roaming, SIM/eSIM and charging;
- travel insurance and what policies actually cover;
- basic scams and tourist traps;
- medication/document preparation where applicable;
- laundry and long-trip clothing rotation;
- food/water basics and local meal patterns;
- what should be booked ahead versus left flexible;
- arrival-day and departure-day procedures;
- disruption handling: delay, cancellation, missed connection, closure;
- seasonal and trip-type packing systems.

### Layer B — Contextual Checklists

Checklists should compose from variables rather than exist as one giant list:

- summer / winter / shoulder season;
- city / beach / hiking / road trip / pilgrimage / mixed;
- weekend / one week / multi-week;
- carry-on only / checked luggage / backpack;
- solo / couple / family / group;
- domestic / EU-Schengen / international;
- novice / experienced traveller;
- hotel / apartment / hostel / camping;
- activity-specific modules such as snorkeling, hiking or formal events.

Checklists should be actionable, reusable and suppress irrelevant items.

### Layer C — Trip Planner

Create a trip with destinations, dates, transport, stays, reservations, interests, constraints, budget and optional targets. Planning is not truth: it is an intended state that can change.

### Layer D — Live Buddy

During travel, Travel Buddy becomes a real-time companion: current logistics, navigation, visual guiding, local context, decisions, replanning, missed-item checking and disruption recovery.

### Layer E — Memory, Diary and Collections

The trip is automatically reconstructed from actual events rather than the original itinerary. Photos, places, stamps, souvenirs, costs, anecdotes and meaningful moments can become durable travel memory.

### Layer F — Maps and Shareable Output

Generate attractive personal maps, route recaps, trip cards, statistics and social-media-ready visual summaries from the trip state already accumulated.

### Layer G — Collective Travel Intelligence

Only after the fundamentals are solid: privacy-safe, consent-based aggregation of real travel outcomes can feed an OTHRYS knowledge harvest and improve advice for future travellers.

---

## 3. The State Model — Never Confuse Plan With Reality

Every meaningful trip item needs explicit state. Minimum vocabulary:

- **IDEA** — considered, not committed;
- **PLANNED** — intended;
- **CONFIRMED** — booking/reservation/transport verified;
- **IN PROGRESS** — currently happening;
- **COMPLETED** — actually done;
- **SKIPPED** — intentionally not done;
- **CANCELLED** — planned/confirmed then cancelled;
- **CHANGED** — material alteration to original plan;
- **DISCOVERED** — unplanned item found during the trip;
- **FAILED** — attempted but could not be completed;
- **UNCERTAIN** — evidence is insufficient.

This is a core law. A planned monastery is not a visited monastery. A booked hotel is not necessarily a completed stay. A proposed restaurant is not a meal eaten. The diary must never silently promote intention into history.

Each state transition should retain evidence and time where practical.

---

## 4. Truth and Verification Doctrine

Travel is time-sensitive. Wrong confidence can strand a user.

Travel Buddy should distinguish:

1. **User-confirmed truth** — “I am here”, “booked”, “done”, a receipt/photo/screenshot, etc.
2. **Authoritative current truth** — operator, venue, official timetable, booking confirmation.
3. **Structured current evidence** — live business/transport/availability systems.
4. **Secondary evidence** — reliable current listings and reputable sources.
5. **Community reports** — useful but probabilistic.
6. **Model inference** — lowest authority and must never masquerade as verified fact.

Rules:

- current transport/opening-hour claims should be checked when consequential;
- prefer the actual operator over aggregators;
- state conflicts instead of choosing silently;
- retain uncertainty when evidence is weak;
- never invent a booking link, timetable, opening hour or completed activity;
- a correction from the traveller updates state immediately;
- repeated mistakes become field-trial defects to harvest, not embarrassing details to erase.

---

## 5. Competence-Adaptive Assistance

Travel Buddy should learn what a traveller already knows.

A novice may need reminders about airport arrival, liquids, passport validity, luggage, local transit, check-in, scams and basic safety. An experienced traveller may find those same prompts patronizing and noisy.

The system should therefore maintain a **travel competence profile** by domain, not a single “beginner/expert” badge. A person may be expert at flights and hotels but inexperienced with hiking, cruises or rental cars.

### Progressive Silence

As competence is demonstrated, generic unsolicited advice fades. The system continues to surface local exceptions, material risks and genuinely useful contextual information.

Example:

Novice: “Your train arrives four hours before check-in. Want me to check luggage storage?”

Experienced traveller: “Bag drop confirmed. Aveiro next.”

Eventually, if nothing needs attention: silence.

---

## 6. Auto-Suggest Must Be Explicit

Proactivity is valuable only when controllable.

Travel Buddy requires a first-class **Auto-Suggest** control. Minimum implementation can be ON/OFF. Later it may support levels such as:

- **OFF / Silent** — answer when asked; only critical alerts break silence;
- **Useful** — contextual suggestions with a high relevance threshold;
- **Proactive** — more active guidance, suitable for novices or users who want it.

Explicit user control overrides inferred preference. Travel Buddy must not become a stream of tips.

**Knowing when not to speak is part of the intelligence.**

---

## 7. Live Buddy Capabilities

Field Trial 001 demonstrates that live travel support is much broader than itinerary generation.

### 7.1 Logistics

- identify the correct station/stop/terminal;
- verify schedules and disruption notices;
- calculate realistic transfer buffers;
- distinguish “late” from “wrong stop/wrong service”;
- provide fallback paths;
- account for luggage, heat, terrain, opening hours and check-in constraints;
- know when a taxi/rideshare is rational rather than forcing public transport.

### 7.2 Visual Guide

Traveller sends a photo of a ruin, sign, artwork, menu, ticket or object. Travel Buddy identifies what can safely be inferred, explains the important context quickly, and links it to the site/route state.

The preferred live-guide response is concise enough to read while standing at the object. Deeper context can be requested.

### 7.3 “What Have I Missed?”

Compare actual completed state against a venue/city/site checklist and return only meaningful omissions. Do not send the traveller back for low-value completeness.

### 7.4 Replanning

Plans must respond to reality: heat, fatigue, blisters, weather, hunger, delays, closures, changed mood, overspending, early completion or spontaneous opportunities.

The optimal recommendation can be **stop optimizing and rest**.

### 7.5 Decision Support

Travel Buddy should understand opportunity cost: a one-kilometre side quest can be a bad recommendation when the last useful bus is approaching. A €100 tour can be bad value when a €3 public bus works. Conversely, a private driver can be good value when it replaces six unreliable connections and unlocks a high-value day.

---

## 8. Diary Doctrine — History, Not Itinerary Fan Fiction

The diary is a primary product surface.

It must preserve:

- actual chronology;
- places actually visited;
- transport actually used;
- meals actually eaten;
- purchases/souvenirs actually acquired;
- costs where known;
- activities cancelled/skipped;
- discoveries and detours;
- memorable conversations/encounters;
- emotional or meaningful moments the traveller chooses to retain;
- corrections.

It should never fill missing gaps with plausible events.

A strong diary contains both **place facts and trip stories**. A technically perfect list of coordinates is less memorable than a day that also captures the absurd pilgrim who searched repeatedly for the hat hanging from his neck, a surprising blessing, an expensive fish, or a Minotaur mosaic the traveller immediately recognized.

Diary output should support daily entry, trip summary, long-form journal, compact timeline and map-linked archive.

---

## 9. Collections and Travel Trophies

Travel is often collectible. Travel Buddy should support optional collection tracks:

- pilgrim/venue stamps;
- UNESCO sites;
- countries/regions/cities visited;
- museums;
- monuments;
- churches/cathedrals/temples;
- LEGO flagship/exclusive items;
- postcards;
- coins;
- local crafts;
- food specialties;
- user-defined collections.

The system can flag collection opportunities without hijacking the itinerary. A stamp book is a good example: once the traveller indicates interest, major cathedrals, monasteries, sanctuaries and pilgrim offices become relevant opportunities.

---

## 10. Shareable Maps — Memory Becomes Distribution

A major output should be a beautiful trip map generated from actual trip state.

### Portugal 2026 Acceptance Example

At the end of Field Trial 001, Travel Buddy should be able to reconstruct the Portugal route without forcing manual re-entry and generate a map showing actual destinations and route segments, with concise highlight bubbles.

Potential highlight vocabulary from the field trial includes Lisbon/Belém/António, Peniche/Berlenga, Óbidos, Nazaré, the monastery/Fátima loop, Coimbra/University/António, Conímbriga/Minotaur, Aveiro and Porto — but the final map must use verified completed state, not this illustrative list.

Exports should eventually include:

- square social post;
- vertical Story/Reel cover;
- landscape recap;
- printable high-resolution poster;
- optional animated route;
- clean/private version with sensitive details removed.

Bubbles should prioritize stories and identity, not clutter every pin. The product can generate several visual styles.

This creates a natural loop:

**Travel Buddy helps the trip → records the trip → makes the trip beautiful → traveller shares it → others discover Travel Buddy.**

---

## 11. Traveller Playbook — Harvest the Little Rules

Travel Buddy should maintain a structured, evidence-aware playbook of practical travel know-how. Examples from the design discussion and field trial include:

- ask a hotel to hold luggage before check-in or after check-out;
- distinguish station lockers from third-party luggage storage;
- verify Sunday/holiday transport separately;
- check the transport operator rather than trusting an aggregator alone;
- understand whether tickets are bought on board, at a wall machine, kiosk, app or office;
- do not overpack the itinerary when heat or transit uncertainty is high;
- know when a walking tour is a useful orientation layer;
- keep important trip state offline enough to survive poor connectivity;
- identify local specialties without turning every meal into an expensive “must-do”;
- ask major religious/pilgrimage sites whether they have a stamp;
- photograph signs/timetables/room numbers/parking locations when useful;
- separate “famous souvenir” from something personally meaningful;
- use a compact day load instead of carrying full luggage where possible;
- build laundry into multi-week travel;
- leave recovery windows after high-intensity city days;
- verify baggage constraints before buying transport;
- account for check-in time when choosing intermediate stops.

These are seeds, not universal laws. Each tip needs scope, freshness, confidence and applicability.

---

## 12. Collective Travel Intelligence — The OTHRYS Loop

With explicit consent and strong privacy design, Travel Buddy can learn from aggregate real-world outcomes across users.

Potential signal:

- advice shown;
- whether it was accepted/ignored;
- outcome success/failure;
- context such as season/day/time/travel mode;
- traveller competence level;
- freshness;
- corroborating reports;
- authoritative verification.

OTHRYS should not promote raw anecdotes directly into advice. The knowledge pipeline should:

**Observe → sanitize → aggregate → cluster → verify → score → localize → promote → monitor → expire/demote.**

Candidate tips can be checked against authoritative sources where possible. Contradictions remain visible to the system. Time-sensitive knowledge expires quickly.

This could create a live evidence-based travel layer richer than static blog posts: not merely what people say they did, but what repeatedly worked under known conditions.

---

## 13. Privacy, Consent and Anti-Abuse Doctrine

Travel data can reveal where a person is, where they sleep, when they are away from home, routines, purchases and interests. Therefore privacy is architecture, not a later compliance task.

Principles:

- personal trip data is private by default;
- collective learning requires explicit, understandable consent;
- sharing a map is separate from contributing data to aggregate learning;
- exact live location should not be exposed in public outputs by default;
- home addresses and lodging details should be aggressively protected;
- aggregate learning should minimize retained personal identifiers;
- users should be able to disable proactive suggestions and data contribution independently;
- social exports should offer privacy-safe granularity;
- businesses must not be able to poison rankings through synthetic “traveller” reports;
- suspicious reports, coordinated manipulation and affiliate incentives require trust controls;
- commercial relationships must never silently distort advice.

Competitive research must explicitly study travel/social products that suffered privacy or data-sharing controversy and extract failure patterns before implementing collective intelligence.

---

## 14. Business and Platform Integrity

Travel Buddy may eventually support monetization, but recommendations must preserve trust.

Possible future gates include subscriptions, premium maps/exports, partner bookings, affiliate links, itinerary packs or B2B travel intelligence. These remain downstream of product usefulness and legal/commercial gates.

A recommendation should never become “best” because it pays more. Paid placement, if ever used, must be visibly distinct from Buddy judgment.

---

## 15. Field Trial 001 — Portugal 2026

Portugal is the canonical first field dataset.

### What makes it valuable

It includes:

- multi-week independent travel;
- flights and airport decisions;
- multiple hotels/guesthouses;
- city blitz days and deliberate slow days;
- intercity bus/train planning;
- public transport and rideshare decisions;
- island/snorkeling logistics;
- UNESCO/heritage visits;
- archaeology and live visual guiding;
- religious sites and pilgrim-stamp collecting;
- food discovery and budget elasticity;
- shopping/souvenir/collecting missions;
- cancellations and refunds;
- an accidental damage/insurance event;
- heat, fatigue, blisters and recovery decisions;
- commercial tour failure and DIY alternatives;
- timetable uncertainty and late transport;
- daily diary reconstruction;
- photo-driven interaction;
- real-time corrections when the assistant was wrong;
- meaningful spontaneous encounters;
- live changes to pace and priorities.

### Harvest law

The eventual Portugal harvest must be reconstructed **turn by turn from primary conversation evidence**, not from memory or an itinerary summary.

For each significant interaction, capture where possible:

- timestamp/date;
- user situation/context;
- known trip state before the interaction;
- question/need;
- evidence/tools available;
- assistant recommendation;
- confidence/verification quality;
- user decision;
- actual outcome;
- correction/failure if any;
- product lesson;
- candidate Travel Buddy requirement;
- candidate Traveller Playbook tip;
- whether the lesson is universal, contextual or personal.

### Failure data is first-class data

Examples of useful defect classes already observed:

- confusing planned and completed activities;
- reconstructing diary chronology incorrectly;
- relying on stale/weak opening-hour evidence;
- overconfident logistics claims;
- visual misidentification corrected by the traveller;
- suggesting unnecessary side quests;
- failing to account for current heat/fatigue;
- insufficiently checking businesses before recommendation;
- repeating generic advice to an experienced traveller.

Do not erase these. Convert them into tests.

---

## 16. Portugal-Derived Product Tests

Travel Buddy should eventually pass scenarios derived from real incidents:

1. A commercial day tour is unavailable or overpriced. Find a viable DIY route using current official transport.
2. A Sunday bus is due but late. Distinguish timetable certainty, live uncertainty and fallback timing without inventing a cancellation.
3. User sends a museum/ruin photo. Explain the object/site briefly, admit uncertainty and update the visited checklist only when appropriate.
4. User corrects an identification. The correction becomes authoritative trip state and propagates to diary/map.
5. User asks “what did I miss?” Return only material omissions from actual completed state.
6. A tempting side trip conflicts with the last practical return bus. Recommend against it.
7. Heat/fatigue rises. Reduce itinerary pressure and offer recovery rather than maximizing attractions.
8. User completes an unplanned meaningful event. Diary importance can outrank originally planned attractions.
9. User asks for yesterday’s diary. Never insert a place that was planned but not visited.
10. User begins collecting stamps. Surface high-probability stamp opportunities without turning every church into a notification.
11. User finishes the trip. Generate a correct route map and social recap from accumulated state.

---

## 17. Personalization Without Overfitting

Travel Buddy should distinguish three knowledge classes:

- **Universal travel knowledge** — broadly applicable rules;
- **Contextual knowledge** — useful only under conditions such as season, location or trip type;
- **Personal preference/behavior** — specific to one traveller.

A preference learned from one person must not become general advice. Likewise, collective popularity must not flatten individual taste.

Examples of personal signals Travel Buddy may learn with appropriate controls:

- preferred pace;
- attraction categories;
- walking tolerance;
- accommodation standards;
- budget style and where splurges are acceptable;
- food interests;
- collections;
- guided-tour preference;
- tolerance for crowds/tourist saturation;
- desired amount of spontaneity;
- preferred transport trade-offs;
- preferred response verbosity while moving.

---

## 18. Competitive Harvest

Travel Buddy should study, not blindly copy:

- visited-country/place trackers such as Places Been/Been-style products;
- trip journaling/social-map products such as Polarsteps-style products;
- itinerary builders;
- booking aggregators;
- map/list products;
- travel checklist apps;
- AI itinerary assistants;
- Camino/pilgrimage credential and route tools;
- products involved in recent location/data-sharing controversies.

Harvest dimensions:

- onboarding;
- trip state model;
- map UX;
- diary capture;
- offline behavior;
- social sharing;
- privacy defaults;
- export/data portability;
- recommendation incentives;
- monetization;
- community data quality;
- failure/controversy lessons.

No competitive feature enters the build merely because a competitor has it.

---

## 19. Relationship to OTHRYS

Travel Buddy is an ideal OTHRYS product because the system can provide the intelligence machinery behind the domain product:

- **Atlas** — structured knowledge and source/evidence context;
- **Mnem** — durable trip memory and event history;
- **Themis** — trust, confidence and promotion gates;
- **Prometheus** — external knowledge/competitor harvest;
- **Cronos** — time-sensitive checks and expiry;
- **Keymaster** — provider/API access and health;
- **Talos** — orchestration/verification where applicable.

Exact implementation must follow current canonical OTHRYS architecture; this book defines product requirements, not permission to bypass governance or roadmap gates.

---

## 20. Domain-First Product Strategy

OTHRYS should prioritize products where the owner has enough lived domain knowledge to test quality aggressively.

Current anchors:

- **VTC:** toys and collecting;
- **Travel Buddy:** travel.

The principle is not “only build hobbies.” It is: begin where product judgment is strongest, where real datasets can be generated, and where bad output is immediately recognizable.

---

## 21. Minimum Viable Travel Buddy

A disciplined first usable version does not need collective intelligence.

It needs:

1. trip creation;
2. itinerary/state ledger;
3. travel fundamentals/checklists;
4. place/booking/transport records;
5. live ask interface with current verification hooks;
6. completed/skipped/changed/discovered tracking;
7. simple daily diary generation from actual state;
8. visited-place map;
9. basic shareable trip map/export;
10. explicit Auto-Suggest ON/OFF;
11. competence-aware suppression of generic advice;
12. privacy-safe defaults.

If these are excellent, the product is already useful.

---

## 22. Later Horizons — Not MVP

Park until foundations prove themselves:

- multi-user collective travel intelligence;
- automated OTHRYS promotion of crowd-derived tips;
- predictive disruption assistance;
- sophisticated competence inference;
- advanced social/community layer;
- affiliate/booking monetization;
- real-time group coordination;
- automated photo/story reels;
- advanced gamification;
- public leaderboards;
- broad B2B travel intelligence.

Do not let these horizons destabilize the basics.

---

## 23. Success Criteria

Travel Buddy succeeds when:

- it reduces travel friction without increasing notification fatigue;
- the traveller trusts its distinction between verified fact and uncertainty;
- it knows what happened rather than merely what was planned;
- it becomes quieter as the traveller demonstrates competence;
- it can recover gracefully when wrong;
- it makes live travel richer, not more screen-bound;
- the diary feels like the traveller’s actual trip;
- maps/exports are good enough that people want to share them;
- privacy remains understandable and controllable;
- the accumulated playbook becomes more useful without becoming noisier;
- Field Trial 001 can be reconstructed accurately from primary evidence.

---

## 24. Canonical Product Laws

1. **Reality beats itinerary.**
2. **Verify what can strand the traveller.**
3. **Never promote planned into completed without evidence.**
4. **Corrections are state updates, not conversational footnotes.**
5. **Failure data becomes tests.**
6. **The right suggestion at the right moment beats fifty tips.**
7. **Silence is a feature.**
8. **Competence earns fewer explanations.**
9. **Rest can be the optimal itinerary decision.**
10. **Personalization must not become universalization.**
11. **Private by default; collective learning by consent.**
12. **Beautiful memories are a product output, not an afterthought.**
13. **Build the boring fundamentals before the intelligence flywheel.**
14. **Harvest primary field evidence, not retrospective mythology.**
15. **Start where domain knowledge is strong enough to catch bullshit.**

---

## 25. Immediate Research / Harvest Queue

- Complete Portugal 2026 Field Trial 001 before final reconstruction.
- Preserve and later harvest the full primary chat history, including corrections.
- Build a structured Field Trial 001 event/defect/lesson dataset.
- Expand the Travel Fundamentals taxonomy and checklist library.
- Research novice-vs-expert travel guidance patterns.
- Competitive harvest: Places Been/Been, Polarsteps and adjacent map/journal/checklist products.
- Investigate the recent travel/location data-sharing controversy referenced during the field trial and extract privacy doctrine.
- Define consent model for collective intelligence.
- Define confidence/freshness model for harvested tips.
- Prototype Portugal share-map formats using actual completed route after the trip.
- Define import/export paths for historical travel data (maps, photos, email/bookings, manual lists) without assuming access.
- Determine how Travel Buddy integrates with the existing Othrys Web Personal Manager travel surface rather than duplicating it.

---

## Closing Doctrine

The best Travel Buddy should feel less like operating travel software and more like travelling with a highly capable companion who remembers the plan, notices reality changing, checks facts when they matter, understands what the traveller already knows, explains what is in front of them, preserves the story accurately, and otherwise gets out of the way.

**Field Trial 001 is still running. Keep harvesting.**
