# The Book of Travel Buddy

**Status:** Canonical product doctrine / living book  
**Field Trial:** Portugal 2026 — Field Trial 001  
**Owner:** OTHRYS  
**Last major harvest:** 2026-09-13  
**Harvest state:** ACTIVE — trip still running; doctrine harvest complete for now

> Travel Buddy is not an itinerary generator. It is a stateful travel companion that helps a traveller prepare, move, decide, understand, remember and share — while knowing when to stay quiet.

---

# 1. Why Travel Buddy Exists

Travel information is abundant but fragmented. A traveller moves between airline sites, hotel apps, maps, transport operators, blogs, social media, museum guides, booking platforms, notes, photos, messages and memory. Most products solve one slice. Travel Buddy should maintain the trip as a living state and bring the right information forward at the right moment.

Portugal 2026 is the first hard real-time field trial: changing plans, buses, trains, hotels, heat, fatigue, food, museums, archaeological sites, opening hours, photos, mistakes, corrections, collections, stamps, costs and spontaneous discoveries.

**Build from observed travel reality, not imagined travel UX.**

**The trip itself is the dataset.**

Travel Buddy should quietly turn a real journey into structured knowledge that can later produce maps, diaries, statistics, lessons, checklists, route intelligence and future product improvements.

---

# 2. Product Boundary

- **Travel Buddy** → travel planning, trip state, live guidance, transport, lodging, food, sightseeing, trip memory, maps, travel collections and post-trip outputs.
- **VTC** → toys and collecting.
- **Personal Manager / OTHRYS Web** → broader personal control surface that may surface Travel Buddy state.

Domain-first doctrine: start with fields the builder knows well enough to detect bad software and bad AI output. VTC begins with collecting; Travel Buddy begins with travelling.

---

# 3. Product Ladder — Basics Before Intelligence

## 3.1 Travel Fundamentals

A trustworthy handbook/checklist engine should cover choosing and booking flights; airports/check-in/security/boarding/connections; passports/visas/documents; accommodation selection and booking; check-in/out, deposits, taxes and luggage hold; rail/bus/metro/taxi/ferry/rental transport; baggage rules and strategy; lockers and third-party storage; money/cards/cash/ATM fees; roaming/SIM/eSIM/charging; insurance reality; scams; laundry; food/water basics; what to reserve; arrival/departure days; disruption handling; and seasonal packing.

## 3.2 Contextual Checklists

Checklists compose from variables: summer/winter/shoulder season; city/beach/hiking/road trip/pilgrimage/mixed; short or multi-week; carry-on/checked/backpack; solo/couple/family/group; domestic/Schengen/international; novice/experienced; hotel/apartment/hostel/camping; and activities such as snorkeling, hiking or cycling.

## 3.3 Trip Planner

Destinations, dates, transport, stays, reservations, interests, constraints, budget, collections and optional targets. Planning is intent, not truth.

## 3.4 Live Buddy

Current logistics, navigation, visual guiding, local context, decision support, replanning, missed-item checking and disruption recovery.

## 3.5 Memory, Diary and Collections

Reconstruct actual events rather than original itinerary. Preserve photos, places, stamps, souvenirs, costs, anecdotes and meaningful moments.

## 3.6 Maps and Shareable Output

Generate attractive route maps, trip cards, statistics and social-ready visual summaries from accumulated state.

## 3.7 Collective Travel Intelligence

Only after fundamentals are trustworthy: privacy-safe, consent-based aggregation of outcomes feeds OTHRYS knowledge harvests.

---

# 4. State Model — Never Confuse Plan With Reality

- **IDEA** — considered.
- **PLANNED** — intended.
- **CONFIRMED** — booking/reservation/transport verified.
- **IN PROGRESS** — happening now.
- **COMPLETED** — actually done.
- **SKIPPED** — intentionally not done.
- **CANCELLED** — planned/confirmed then cancelled.
- **CHANGED** — materially altered.
- **DISCOVERED** — unplanned discovery.
- **FAILED** — attempted but could not complete.
- **UNCERTAIN** — insufficient evidence.

**A planned monastery is not a visited monastery. A booked hotel is not automatically a completed stay. A proposed meal is not a meal eaten.**

Transitions should retain evidence, date/time and confidence where practical.

---

# 5. Truth and Verification Doctrine

Evidence hierarchy:

1. Traveller-confirmed truth: “I am here”, “booked”, “done”, receipt/photo/screenshot.
2. Authoritative current truth: operator, venue, hotel, official timetable, booking confirmation.
3. Structured current evidence: live business/transport/availability systems.
4. Reputable current secondary evidence.
5. Community reports.
6. Model inference — lowest authority.

Current opening hours and transport should be checked when consequential. Prefer operators to aggregators. Surface conflicts. Never invent links, timetables, hours, distances or completion. If exact location is unavailable, do not pretend precision. User screenshots are primary evidence. Corrections update state immediately.

---

# 6. Competence-Adaptive Assistance and Progressive Silence

Competence is per domain, not a single beginner/expert badge. A traveller can be excellent with flights/hotels yet new to snorkeling, e-bikes or pilgrimage routes.

As competence is demonstrated, generic reminders fade. Continue surfacing local exceptions, time-sensitive risks and genuinely useful context.

Novice: “Your train arrives four hours before check-in. Want me to check luggage storage?”  
Experienced: “Bag drop confirmed. Aveiro next.”  
Expert with nothing actionable: silence.

**The intelligence is partly knowing when not to speak.**

---

# 7. Proactivity Control

Auto-Suggest is first-class and explicit:

- **OFF / Silent** — answer when asked; only genuinely critical alerts may break silence.
- **Useful** — high-relevance contextual suggestions.
- **Proactive** — more active guidance for users who want it.

Explicit control overrides inferred preference. Data-contribution consent is separate from Auto-Suggest.

---

# 8. Context Packs, Not Gimmick Modes

Travel Buddy should avoid proliferating narrow “modes” that make the model act more certain than its evidence permits. A dedicated **Pilgrim Mode** is the cautionary example: pilgrimage is too specific to justify an assistant persona that may start improvising route knowledge. Sending someone kilometres down an unverified trail is materially worse than failing to mention a souvenir shop.

Use **composable context packs** instead. Packs add relevant knowledge, checklists, fields and suggestion candidates without changing the core truth/verification doctrine.

Candidate packs include:

- pilgrimage/religious travel;
- hiking/walking;
- beach/snorkeling;
- cycling;
- road trip;
- winter/cold-weather;
- family/children;
- accessibility;
- food-focused travel;
- heritage/archaeology;
- collecting/shopping;
- business/event travel.

A pilgrimage context pack may add credential/stamp opportunities, pilgrim offices, service/Mass times, accommodation conventions, baggage-transfer concepts, route stages and etiquette. It **must not** infer that a trail is safe/current/open merely because pilgrimage context is active.

## Verification Escalation Rule

**Specialized context may increase available guidance, but must never lower the verification threshold. Higher consequence requires stronger evidence.**

Examples:

- “This church may offer a stamp” → low consequence; can be phrased as a possibility.
- “Mass is at 18:30” → time-sensitive; verify against current authoritative evidence where possible.
- “Take this trail; it rejoins the Camino in 8 km” → high consequence; require authoritative/current route evidence or clearly decline certainty.
- “Last bus is at 13:55” → high consequence; operator/current timetable evidence dominates.

Context packs are filters and capability bundles, **not hallucination licenses**.

---

# 9. Live Buddy Capabilities

## Logistics

Identify correct stations/stops/terminals, verify schedules/disruptions, calculate realistic buffers, offer fallbacks, account for luggage/heat/terrain/hotel check-in, and know when taxi/private transfer is rational.

## Visual Guide

Photos of ruins, signs, artwork, menus, tickets, maps, timetables, buildings and souvenirs should yield concise high-value context while the traveller is standing there. Deep detail is optional. Ambiguous visual interpretation must carry uncertainty.

## “What Did I Miss?”

Compare actual completed state with meaningful venue/city/site targets. Do not send a traveller back for low-value completeness.

## Replanning

Respond to fatigue, heat, blisters, poor sleep, weather, hunger, closures, delays, changed mood, overspending, early completion and spontaneous discoveries. Sometimes the right answer is rest, food, shade or hotel.

## Side-Quest Budget

Evaluate remaining time, hard deadlines, last transport, walking distance, luggage, fatigue, expected value and recovery options. Conímbriga’s waterfall is the canonical example: an interesting nearby side quest was inferior to protecting the finite Sunday return bus.

**Hard constraint beats optional curiosity.**

---

# 10. Diary Doctrine — History, Not Itinerary Fan Fiction

Preserve actual chronology, actual places, transport, meals, purchases, costs, skips/cancellations, discoveries, encounters, meaningful moments and corrections. Never fill gaps with plausible events.

Support detailed daily entry, short recap, map-linked locations, costs, food, souvenirs, lessons, photo anchors and unresolved facts.

A good diary contains both coordinates and stories: the Hat Pilgrim, the unexpected Franciscan blessing, the €103 snapper, the Minotaur correction and other moments that make the trip recognizably this traveller’s trip.

---

# 11. Collections and Travel Trophies

Optional tracks include stamps, UNESCO, countries/regions/cities, museums, monuments, religious sites, LEGO exclusives/minifigs, postcards, coins, crafts, foods and user-defined collections.

Portugal examples: St Anthony places, pilgrim/site stamps, LEGO, vintage toys, masks, postcards, coins, Roman souvenirs, Portuguese swallows and regional foods. Collection opportunities should enrich rather than dictate the itinerary.

---

# 12. Shareable Maps — Memory Becomes Distribution

Portugal 2026 should ultimately generate a beautiful map without manual re-entry: actual route segments, cities/day trips and concise story bubbles, with optional UNESCO, food, souvenir, St Anthony, Roman/history and collectibles layers.

Exports can include square social post, vertical Story/Reel, landscape recap, printable poster, animated route and privacy-safe version.

**Help the trip → record the trip → make the trip beautiful → traveller shares it → others discover Travel Buddy.**

---

# 13. Traveller Playbook — Small Rules Worth Harvesting

The playbook should capture reusable little rules: hotel bag drops; station lockers vs third-party storage; Sunday/holiday transport; operator timetable over aggregator; where/how tickets are bought; heat-aware pacing; walking tours as optional orientation; offline essentials; local-specialty price judgment; asking for stamps; photographing useful signs/timetables; meaningful vs famous souvenirs; laundry cadence; recovery after blitz days; baggage constraints; check-in timing; when private transfer beats fragile connections; exact distance verification; branch-specific store exclusives; suppression of already-completed places; and protection of hard transport deadlines.

These are seeds, not universal laws. Each tip needs scope, freshness, confidence and applicability.

---

# 14. Collective Travel Intelligence — OTHRYS Loop

With explicit consent and strong privacy controls, aggregate real outcomes can become a living evidence layer. Signals may include advice shown, accepted/ignored, success/failure, season/day/time, travel mode, competence, freshness, corroboration and authoritative verification.

Pipeline:

**Observe → sanitize → aggregate → cluster → verify → score → localize → promote → monitor → expire/demote.**

Raw anecdotes never become universal advice automatically. OTHRYS should learn both what works and when advice should not be shown.

---

# 15. Privacy, Consent and Anti-Abuse

Travel data can reveal location, lodging, routines, purchases and absence from home. Trip data is private by default. Collective learning is opt-in. Public sharing is separate from data contribution. Exact live location and lodging details are protected. Retain minimal identifiers. Provide privacy-safe map granularity. Detect business poisoning/fake traveller reports. Commercial incentives must never silently influence ranking.

Competitive harvest should explicitly study travel/social products that created controversy by sharing or exposing location/travel data and derive failure patterns before implementing collective intelligence.

---

# 16. Business Integrity

Possible later monetization: subscriptions, premium exports, partner bookings, affiliates, itinerary packs or B2B intelligence. Recommendation trust remains non-negotiable. A place never becomes “best” merely because it pays more.

---

# 17. Field Trial 001 — Portugal 2026

The first canonical live dataset: roughly two weeks of independent travel before study begins 21 September 2026, combining capital-city blitzing, recovery days, history, Roman archaeology, religious history, food splurges/frugality, buses/trains, hotels only, photo-driven guiding, collecting and spontaneous replanning.

Known trip-level preferences/constraints include no hostels; budget-conscious overall with selective splurges; dislike of excessive tourist saturation; interest in walking tours, Roman history, archaeology, UNESCO, St Anthony, snorkeling, meaningful souvenirs, LEGO, vintage toys, coins and postcards; desire for exact transport/distance facts; fast city completion; and appreciation when the assistant says there is nothing worth forcing.

## Chronology harvest so far

### Lisbon

Base: Hotel Roma. Confirmed/strongly established trip events include haircut, Decathlon, Jerónimos/Belém, Pastéis de Belém, Monument to the Discoveries, Belém Tower, Praça do Comércio area, St Anthony church/crypt twice, St Anthony souvenirs/coins, Bertrand, personalized Lisbon LEGO minifigure, Castelo de São Jorge, Casio/Swatch checks and unsuccessful vintage-toy hunting. Tram 28 was skipped in crowd/heat/replacement-bus context. Metro zapping and Uber were practical logistics topics.

The booked “Mystical Sintra” tour (~10 h, ~07:50 pickup) was cancelled after poor sleep and low desire for a fairy-tale-castle marathon. Reception emailed about refund. Blisters/fatigue led to hotel recovery; later ~10 h sleep produced strong recovery. Lisbon was experienced as tourist-saturated/easy-mode, a preference signal rather than objective city judgment.

### Lisbon → Peniche / Peniche / Berlenga

Transfer questions covered exact Lisbon bus station, Uber timing, Peniche arrival stop and hotel distance. Peniche included coastal/cliff walking, seafood, lace/souvenir checking and Berlenga/snorkeling planning. Berlenga became a meaningful completed-area experience by later “Peniche and Berlanga: dusted” state. A wrong-city restaurant answer became a regression-test seed. A Peniche fish meal around €44.50 later became comparison context for Nazaré.

### Óbidos phase and €69 incident

Transit from Peniche required alternatives to FlixBus and exact ticket/stop logic. Laundry pressure emerged. A hanging pot collision/breakage led to immediate €69 payment. Insurance investigation showed the practical difference between being insured and a loss being worth/eligible to claim because of a roughly €350 threshold/deductible context. This seeded an incident/insurance workflow.

### Nazaré and heritage loop — 11 Sep

Nazaré became a base. E-bike/coastal riding was considered, then deprioritized in favor of heritage. Private driver/chauffeur was selected because it replaced many fragile public-transport links. Confirmed route: Nazaré → Alcobaça → Aljubarrota → Batalha → Fátima → Nazaré. Aljubarrota is **COMPLETED**; earlier assistant diary confusion is a key defect. Payment-before/after-driver reasoning seeded a checklist.

### €103 snapper

High-quality grilled red snapper in Nazaré cost €103 and became a major trip story/running joke. The traveller judged it expensive but worth it, emphasizing memorable crispy grilling. Budget analytics must distinguish waste from deliberate worthwhile splurge.

### Coimbra — 12 Sep

Two-night plan chosen to cover city/university plus a dedicated Conímbriga day. University of Coimbra visit included ~€16.50 ticket, Joanina timed entry ~15:40, Cabinet of Curiosities, São Miguel Chapel, Royal Palace/science areas and university mug. Cabinet inspired desire for a small antique glass-front cabinet at home. Lunch: Pescada à Zé do Pipo ~€7 + drink ~€2. Dinner: A Cozinha da Maria, chanfana ~€17.30 + beer and homemade almond tart. Free walking tour around 17:00. St Anthony chain developed through Santa Cruz and the Five Franciscan Martyrs: Lisbon = origin, Coimbra = transformation, Padua = tomb/cult.

### Conímbriga — 13 Sep

Commercial tours failed/poor value (Viator unavailable; Booking effectively ~€160/minimum two; unrelated schist-village alternative). DIY won: SIT 209, Coimbra Portagem 09:30, arrival ~10:07, target Sunday return 13:55.

Live-photo guide covered Roman road; 1899 mosaics; shops south of road; House of the Swastika; House of Skeletons; Baths of the Wall; Augustan/Southern Baths; Great Southern Baths; insula north of baths; phallic-vase insula/fullonica; Forum; castellum divisorium/aqueduct; aqueduct baths; viaduct building; northeastern late occupation; House of the Fountains; House attributed to Cantaber; Late Imperial wall; and Paleochristian basilica as possible missed/uncertain item.

At House of the Fountains the assistant initially misidentified the labyrinth’s central iconography; traveller corrected it to the **Minotaur**. Canonical correction: Cretan labyrinth with central Minotaur motif. Visual ambiguity must reduce confidence.

Pilgrimage-route signs appeared for Caminhos de Fátima, Rota Carmelita and Camino de Santiago, plus a ~1 km waterfall. Because the return bus was finite, the waterfall was suppressed. This is the canonical **fuck the side quest, catch the bus** lesson.

Museum followed ruins and felt small to the traveller. Shop produced no compelling Minotaur souvenir. A printable Minotaur/labyrinth artwork was generated as a personal substitute.

A Scandinavian pilgrim repeatedly searched the museum shop for a hat that was on his neck while visibly exhausted/sweaty. “Hat Pilgrim” is diary-worthy but also illustrates fatigue/dehydration cognitive load and why Travel Buddy should simplify under strain.

### Coimbra evening — Santo António dos Olivais

After hotel rest and a delay caused by a phone call, the traveller still went to Santo António dos Olivais and attended the full 18:30 Portuguese Mass. Despite not understanding the language, the communal ritual, music/sign of peace and atmosphere were meaningful. After Mass he asked for a stamp; a Franciscan friar asked where he was from and gave a personal blessing. The experience unexpectedly “felt kinda good” while the traveller retained skepticism toward the institution. Travel Buddy should preserve such moments without over-spiritualizing them.

This completes the Lisbon → Coimbra Anthony arc: **Fernando walks in. António walks out.** Porto may contain devotional continuations, but they are not biographical equivalents.

Later in Coimbra Baixa, Nicola meal: cod pastries/pastéis de bacalhau with bean rice, €13.95, five pastries visible in the meal photo. The day was judged a very good day combining many favorite interests.

### Planned next state — 14 Sep onward

Coimbra → Aveiro speedrun → Porto. Aveiro luggage storage requires re-verification; a third-party candidate near station had been identified. Aveiro targets: canals/centre/ovos moles, Costa Nova only if practical. Porto planned for walking/food, cathedral stamp/pilgrim-office opportunity, St Anthony devotional stop, LEGO/vintage-toy checks and final trip phase. These remain PLANNED until confirmed.

---

# 18. Food, Souvenir and Physical-State Memory

Meaningful food anchors: Pastéis de Belém; bifana/bacalhau context in Lisbon; Peniche seafood; €103 Nazaré snapper; Coimbra Pescada à Zé do Pipo; chanfana; almond tart; Nicola cod pastries with bean rice.

Known acquisitions/targets: St Anthony tiles/coins; personalized Lisbon LEGO minifigure; University of Coimbra mug; three small Portuguese swallow ceramics; stamps in a small travel book; postcards/coins/local heritage objects; vintage toys largely unsuccessful; Minotaur souvenir absent, leading to custom artwork.

Physical-state lessons: poor sleep → Sintra cancellation; ~10 h sleep → recovery; blisters → lower intensity; heat/crowds → Tram 28 skip; hotel/bath/rest/food can be correct itinerary decisions; alternating blitz and recovery works better than continuous optimization. Use lightweight travel-energy state without medicalizing ordinary fatigue.

---

# 19. Errors, Corrections and Regression Tests

Preserve failures as QA data: wrong-city restaurant; Aljubarrota diary confusion; vague distance answers; stale-memory answers despite screenshots/operator evidence; unsupported branch-exclusive merchandise assumptions; suggesting completed sights; planned→completed contamination; timetable conflicts; Minotaur visual misread; over-eager side quests.

Candidate tests include: active city never drifts; primary evidence can promote Aljubarrota to COMPLETED; last transport beats optional site; ambiguous image gets uncertainty; cancelled tour remains CANCELLED; exact distance is verified or labeled unverified; official operator wins conflicts; no hostels when excluded; screenshot beats memory; diary preserves actual chronology; context packs never lower verification threshold; hiking/pilgrimage route instructions require stronger evidence than low-consequence cultural suggestions.

---

# 20. Suggested Data Model

Core entities:

**Trip:** title, dates, status, home departure/return, preferences, budget posture, style, privacy.  
**Leg:** origin/destination, mode, operator, booking, planned/actual time, stop, luggage, status, evidence.  
**Stay:** property, city, check-in/out, bag policy, laundry, breakfast, booking/actual state.  
**Place Visit:** place, category, coordinates, times, state, evidence, photos, notes, map link, significance.  
**Meal:** venue, dish, city, cost, reaction, specialty, splurge/budget.  
**Purchase:** item, category, location, price, significance, fragility, packed state.  
**Incident:** type, date/place, narrative, cost, evidence, insurance relevance, resolution.  
**Correction:** original claim, corrected claim, source, affected entities, regression candidate.  
**Daily State:** energy, sleep, heat/weather relevance, physical friction, current city, hard deadlines, priorities, “dusted” confidence.  
**Context Pack:** pack type, activation evidence, user override, knowledge modules, verification requirements.  
**Suggestion Event:** suggestion, reason, confidence, evidence, auto-suggest state, accepted/ignored, outcome.  
**Share Artifact:** included places, privacy level, route, bubbles, visual format, publication state.

---

# 21. Post-Trip Forensic Harvest

When Portugal ends, reconstruct from primary chats/screenshots — never memory alone. For each significant interaction capture timestamp/date, location, prior state, question, evidence, recommendation, verification quality, decision, outcome, correction/failure, product lesson, requirement, Playbook rule, regression test, diary story, map point and cost/purchase/food state.

Outputs: canonical diary; route graph; map dataset; visited-place ledger with coordinates/links; transport ledger; accommodation ledger; food ledger; souvenir/collection ledger; incident ledger; assistant-error ledger; Traveller Playbook delta; requirements delta; privacy-safe shareable recap; product acceptance report.

---

# 22. Portugal Field Trial Acceptance Criteria

Travel Buddy should answer without manual reconstruction: where did I go each day; what did I actually visit; what was skipped/cancelled; what did I eat/buy; cheap wins vs splurges; UNESCO/Roman/St Anthony/collection completions; transport and hotel bases; useful advice; assistant failures; route evolution; blitz vs recovery days; best stories; and can it generate an accurate beautiful map from actual state?

The final visual output should require minimal to zero manual re-entry.

---

# 23. Product Personality

Capable companion, not brochure. Serious about logistics; relaxed about harmless spontaneity; willing to say “not worth it”; no fake certainty; no tourist-board filler; no moralizing about conscious splurges; no endless generic reminders; fast correction; deep history on request; short live-guide bursts while walking.

A user-aligned tone may say **“fuck the side quest, catch the bus”** when that accurately expresses the decision. Tone never substitutes for evidence.

---

# 24. Core Laws

1. Reality beats itinerary.
2. Primary evidence beats memory.
3. Current operator truth beats aggregator convenience.
4. Corrections update state immediately.
5. Never invent completion.
6. Never invent precision.
7. Protect hard transport deadlines.
8. Rest is a valid itinerary decision.
9. Value is not the same as cheapness.
10. A good diary preserves stories, not only coordinates.
11. Progressive silence is a feature.
12. Competence should reduce noise.
13. Collections enrich; they do not dictate.
14. Private travel data stays private by default.
15. Commercial incentives never silently distort advice.
16. Repeated mistakes become regression tests.
17. Specialized context never lowers verification standards.
18. High-consequence guidance requires stronger evidence.
19. Context packs add capability; they do not create authority.
20. Hard constraint beats optional curiosity.
21. Field Trial 001 continues until the traveller is home.

---

# 25. Current Closure Point

The foundational Travel Buddy doctrine is **complete enough for now**. Do not inflate the concept with speculative frills while Field Trial 001 is still generating evidence.

Current build sequence should remain:

**solid travel fundamentals → state/checklist engine → trip planner → live verified Buddy → diary/map outputs → optional context packs → collective OTHRYS intelligence.**

Portugal 2026 remains open as the first living corpus. Continue capturing new evidence as the trip unfolds, but defer the full forensic harvest until home arrival.

The best Travel Buddy should feel less like operating travel software and more like travelling with a highly capable companion who remembers the plan, notices reality changing, checks facts when they matter, understands what the traveller already knows, explains what is in front of them, protects deadlines, preserves the story accurately, learns from corrections, and otherwise gets out of the way.

**Field Trial 001 is still running. Keep harvesting until home. Then perform the forensic pass.**
