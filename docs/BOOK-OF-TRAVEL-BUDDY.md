# The Book of Travel Buddy

**Status:** Canonical product doctrine / living book  
**Field Trial:** Portugal 2026 — Field Trial 001  
**Owner:** OTHRYS  
**Last major harvest:** 2026-09-13  
**Harvest state:** ACTIVE — trip still running

> Travel Buddy is not an itinerary generator. It is a stateful travel companion that helps a traveller prepare, move, decide, understand, remember and share — while knowing when to stay quiet.

---

# 1. Why Travel Buddy Exists

Travel information is abundant but fragmented. A traveller moves between airline sites, hotel apps, maps, transport operators, blogs, social media, museum guides, booking platforms, notes, photos, messages and memory. Most products solve one slice. Travel Buddy should maintain the trip as a living state and bring the right information forward at the right moment.

The product starts with a domain the owner knows through extensive real travel. Portugal 2026 is not a hypothetical persona exercise. It is the first hard real-time field trial, with changing plans, buses, trains, hotels, heat, fatigue, food, museums, archaeological sites, opening hours, photos, mistakes, corrections, collections, stamps, costs and spontaneous discoveries.

The foundational principle is:

**Build from observed travel reality, not imagined travel UX.**

A second principle follows from the field trial:

**The trip itself is the dataset.**

Travel Buddy should not only answer questions. It should quietly turn a real journey into structured knowledge that can later produce maps, diaries, statistics, lessons, checklists, route intelligence and future product improvements.

---

# 2. Product Boundary

Travel Buddy owns the travel domain inside OTHRYS.

- **Travel Buddy** → travel planning, trip state, live guidance, transport, lodging, food, sightseeing, trip memory, maps, travel collections and post-trip outputs.
- **VTC** → toys and collecting domain.
- **Personal Manager / OTHRYS Web** → broader personal control surface that may surface Travel Buddy state but does not redefine travel doctrine.

The product should feel domain-native. It should not become a generic AI assistant with a travel skin.

---

# 3. Product Ladder — Basics Before Intelligence

Travel Buddy must resist beginning with flashy AI features. The fundamentals are already a full product.

## 3.1 Layer A — Travel Fundamentals

A trustworthy handbook/checklist system covering at minimum:

- choosing, comparing and booking flights;
- airports, check-in, boarding, security, transfers and arrivals;
- passports, visas, documents and copies;
- accommodation selection, booking, check-in, check-out, deposits, city tax and luggage storage;
- rail, bus, metro, taxi/rideshare, ferry and rental transport;
- luggage rules and baggage strategy;
- station lockers versus third-party bag storage;
- money, cards, cash, ATMs and fees;
- mobile connectivity, roaming, SIM/eSIM and charging;
- insurance and practical coverage reality;
- common scams and tourist traps;
- medication/document prep where applicable;
- laundry and long-trip clothing rotation;
- food/water basics and local meal patterns;
- what to reserve in advance versus leave flexible;
- arrival/departure-day procedures;
- disruption handling;
- weather/season packing systems.

## 3.2 Layer B — Contextual Checklists

Checklist composition by variables rather than giant static lists:

- summer / winter / shoulder season;
- city / beach / hiking / road trip / pilgrimage / mixed;
- short trip / one week / multi-week;
- carry-on / checked luggage / backpack;
- solo / couple / family / group;
- domestic / Schengen / international;
- novice / experienced;
- hotel / apartment / hostel / camping;
- special activities such as snorkeling, hiking, cycling or formal events.

## 3.3 Layer C — Trip Planner

Create a trip with destinations, dates, transport, stays, reservations, interests, constraints, budget, collections and optional targets.

Planning is intent, not truth.

## 3.4 Layer D — Live Buddy

During travel, Travel Buddy becomes a real-time companion: current logistics, navigation, visual guiding, local context, decision support, replanning, missed-item checking and disruption recovery.

## 3.5 Layer E — Memory, Diary and Collections

The trip is automatically reconstructed from actual events rather than the original itinerary. Photos, places, stamps, souvenirs, costs, anecdotes and meaningful moments become durable memory.

## 3.6 Layer F — Maps and Shareable Output

Generate attractive route maps, trip cards, statistics and social-ready visual summaries from accumulated state.

## 3.7 Layer G — Collective Travel Intelligence

Only after fundamentals are trustworthy: privacy-safe, consent-based aggregation of outcomes can feed OTHRYS knowledge harvests and improve future advice.

---

# 4. State Model — Never Confuse Plan With Reality

Every meaningful trip item needs explicit state.

- **IDEA** — considered, not committed.
- **PLANNED** — intended.
- **CONFIRMED** — reservation/booking/transport verified.
- **IN PROGRESS** — currently happening.
- **COMPLETED** — actually done.
- **SKIPPED** — intentionally not done.
- **CANCELLED** — planned or confirmed then cancelled.
- **CHANGED** — materially altered.
- **DISCOVERED** — unplanned discovery.
- **FAILED** — attempted but could not be completed.
- **UNCERTAIN** — evidence insufficient.

Core law:

**A planned monastery is not a visited monastery. A booked hotel is not automatically a completed stay. A proposed meal is not a meal eaten.**

State transitions should retain evidence, date/time and confidence where practical.

---

# 5. Truth and Verification Doctrine

Travel is time-sensitive. Wrong confidence can strand a user.

Evidence hierarchy:

1. **Traveller-confirmed truth** — “I am here”, “booked”, “done”, receipt/photo/screenshot.
2. **Authoritative current truth** — operator, venue, hotel, official timetable, booking confirmation.
3. **Structured current evidence** — live business/transport/availability systems.
4. **Secondary evidence** — reputable current listings.
5. **Community reports** — useful but probabilistic.
6. **Model inference** — lowest authority.

Rules:

- current opening hours and transport should be checked when consequential;
- prefer actual operator over aggregator;
- surface conflicts instead of silently choosing;
- never invent booking links, timetables, opening hours or completed activities;
- update immediately when traveller corrects the system;
- repeated errors become product defects to harvest, not details to hide;
- if exact location is unavailable, do not pretend precision;
- screenshots supplied by the traveller are valuable primary evidence.

---

# 6. Competence-Adaptive Assistance

Travel Buddy should learn what the traveller already knows.

A traveller may be experienced with flights and hotels but inexperienced with beach holidays, pilgrim routes, e-bikes, island boats or snorkeling.

Maintain competence by domain, not one global level.

## Progressive Silence

As competence is demonstrated, generic reminders fade. Continue surfacing local exceptions, time-sensitive risks and genuinely useful context.

Example:

- novice: “Your train arrives four hours before check-in. Want me to check luggage storage?”
- experienced: “Bag drop confirmed. Aveiro next.”
- expert with nothing actionable: silence.

---

# 7. Proactivity Control

Travel Buddy requires an explicit Auto-Suggest setting.

- **OFF / Silent** — answer when asked; only critical alerts break silence.
- **Useful** — contextual suggestions above a high relevance threshold.
- **Proactive** — more active guidance for users who want it.

Explicit setting overrides inference.

**Knowing when not to speak is part of the intelligence.**

---

# 8. Live Buddy Capabilities

## 8.1 Logistics

Travel Buddy should:

- identify correct station, stop, terminal and platform where possible;
- verify schedules and disruption notices;
- calculate realistic buffers;
- distinguish wrong stop from delayed service;
- offer fallback paths;
- account for luggage, heat, terrain, opening hours and hotel check-in;
- know when taxi/rideshare is rational;
- understand that a €100 private driver may be better value than six fragile public-transport links if it unlocks a high-value day.

## 8.2 Visual Guide

The traveller can send a photo of:

- ruin;
- sign;
- artwork;
- menu;
- ticket;
- object;
- map;
- timetable;
- building;
- souvenir.

Travel Buddy should explain the high-value context quickly enough to read while standing there. Deep detail can follow on request.

## 8.3 “What Did I Miss?”

Compare completed state with a venue/city/site checklist. Return only meaningful omissions. Do not force low-value completeness.

## 8.4 Replanning

Plans respond to reality:

- fatigue;
- heat;
- blisters;
- bad sleep;
- weather;
- hunger;
- closures;
- transport gaps;
- changed mood;
- overspending;
- early completion;
- spontaneous discoveries.

Sometimes the correct recommendation is **rest, stop optimizing, eat, or go back to the hotel**.

## 8.5 Live Side-Quest Control

A recurring field-trial pattern is attractive side quests appearing near a hard constraint.

Example: Conímbriga had a nearby 1 km waterfall and pilgrimage-route signs, but a finite Sunday return bus. The correct behavior was to suppress the side quest and protect the transport deadline.

Travel Buddy therefore needs an explicit **side-quest budget** informed by:

- remaining time;
- last transport;
- walking distance;
- luggage;
- fatigue;
- expected value;
- ability to recover if wrong.

---

# 9. Diary Doctrine — History, Not Itinerary Fan Fiction

The diary is a primary surface.

It must preserve:

- actual chronology;
- actual places visited;
- actual transport used;
- meals actually eaten;
- purchases/souvenirs actually acquired;
- known costs;
- cancellations/skips;
- discoveries/detours;
- memorable encounters;
- meaningful moments the traveller chooses to retain;
- corrections.

Never fill gaps with plausible events.

A strong entry preserves both place facts and story. Exact place order matters when the traveller later wants a map or retrospective.

Daily diary output should support:

- detailed entry;
- short recap;
- map-linked location list;
- cost summary;
- food log;
- souvenir log;
- lessons learned;
- photo anchors;
- unresolved facts to verify later.

---

# 10. Collections and Travel Trophies

Optional collection tracks:

- pilgrim/site stamps;
- UNESCO sites;
- countries/regions/cities;
- museums;
- monuments;
- religious sites;
- LEGO exclusives/minifigs;
- postcards;
- coins;
- local crafts;
- food specialties;
- user-defined collections.

The system can flag collection opportunities without hijacking the route.

For this field trial, especially relevant categories include:

- St Anthony-related places;
- LEGO stores/minifigure opportunities;
- vintage toy stores;
- masks;
- postcards;
- coins;
- local ceramics/crafts;
- Roman/archaeological souvenirs;
- Portuguese swallows;
- famous foods by city/region.

---

# 11. Shareable Maps — Memory Becomes Distribution

A major output should be a beautiful map generated from actual trip state.

Portugal 2026 should eventually be reconstructed without manual re-entry and produce:

- actual route segments;
- cities and day trips;
- highlight bubbles;
- UNESCO layer;
- optional food/souvenir layer;
- optional St Anthony/pilgrimage layer;
- optional Roman/history layer;
- optional collectibles layer.

Exports:

- square social card;
- vertical Story/Reel cover;
- landscape recap;
- printable poster;
- optional animated route;
- private version with sensitive details removed.

Loop:

**Travel Buddy helps the trip → records the trip → makes the trip beautiful → traveller shares it → others discover Travel Buddy.**

---

# 12. Traveller Playbook — Small Rules Worth Harvesting

Field-trial rules worth preserving:

- ask hotels about early luggage drop and late luggage hold;
- distinguish station lockers from third-party luggage storage;
- verify Sunday/holiday transport separately;
- prefer operator timetable over generic route aggregators;
- determine whether tickets are bought on board, at machine, kiosk, office or app;
- do not overpack hot days;
- walking tours are useful orientation layers but not mandatory everywhere;
- keep enough state offline to survive poor signal;
- local specialties do not all need to become expensive “must-dos”;
- ask religious/pilgrimage sites about stamps;
- photograph signs/timetables when they may matter later;
- distinguish “famous souvenir” from “meaningful souvenir”;
- build laundry into long trips;
- leave recovery windows after capital-city blitz days;
- check baggage constraints before choosing transfers;
- account for hotel check-in when inserting intermediate stops;
- a private transfer can be rational when public transport creates too many fragile links;
- verify actual distance from station/stop to hotel rather than saying “close” loosely;
- never assume a store branch has the same exclusives as another branch;
- never treat route-planner output as equivalent to official transport truth;
- when a traveller says a place is already done, suppress it immediately from future suggestions.

---

# 13. Collective Travel Intelligence — OTHRYS Loop

With explicit consent and strong privacy controls, Travel Buddy can learn from aggregate real outcomes.

Potential signals:

- advice shown;
- accepted/ignored;
- outcome success/failure;
- season/day/time;
- travel mode;
- traveller competence;
- source freshness;
- corroborating reports;
- authoritative verification.

Promotion pipeline:

**Observe → sanitize → aggregate → cluster → verify → score → localize → promote → monitor → expire/demote.**

Raw anecdotes never become universal advice automatically.

---

# 14. Privacy, Consent and Anti-Abuse

Travel data can reveal exact location, lodging, routines, purchases and home absence.

Principles:

- trip data private by default;
- collective learning opt-in;
- public sharing separate from aggregate learning;
- exact live location hidden from public outputs by default;
- lodging details aggressively protected;
- minimize retained identifiers;
- separate proactivity consent from data-contribution consent;
- privacy-safe map granularity;
- prevent business poisoning and fake traveller reports;
- affiliate incentives must never silently influence ranking.

---

# 15. Business Integrity

Future monetization may include subscriptions, premium exports, partner bookings, affiliate links, itinerary packs or B2B intelligence.

But recommendation trust is non-negotiable.

A place must never become “best” because it pays more.

---

# 16. FIELD TRIAL 001 — PORTUGAL 2026

This is the canonical first live dataset.

The trip began as a roughly two-week Portugal journey before study starts on 21 September 2026. The traveller deliberately used it both as a break after leaving a difficult job period and as a live experiment in independent travel support.

The trip style combines:

- capital-city blitzing;
- slow recovery days;
- history and archaeology;
- Roman sites;
- religious history;
- food splurges mixed with frugality;
- buses and trains;
- hotels only, no hostels;
- photo-driven live guiding;
- collecting and souvenirs;
- spontaneous replanning.

The field trial is still open as of 13 September 2026.

---

# 17. Portugal 2026 — Known Traveller Constraints and Preferences

Preserve these as trip-level context, not universal personality assumptions:

- avoids hostels;
- budget-conscious overall, but willing to splurge selectively on memorable food/experiences;
- prefers Brussels Airport over Charleroi when practical;
- dislikes tourist saturation and “theme-park tourism” when it overwhelms the place;
- likes free walking tours as a city-orientation mechanism;
- strong interest in Roman history, archaeology, UNESCO and history generally;
- strong interest in St Anthony during this trip because Lisbon, Coimbra and Padua form a personal historical chain;
- likes snorkeling when the setting is worthwhile;
- dislikes pointless beach inactivity but was intentionally experimenting with slower beach travel;
- likes meaningful souvenirs rather than generic tat;
- hunts for LEGO exclusives/minifigure experiences and vintage toys;
- likes coins, postcards and unusual local objects;
- wants exact transport facts and distances, not vague assurances;
- wants live corrections immediately when wrong;
- often finishes cities faster than generic tourism itineraries assume;
- appreciates being told when there is genuinely nothing else worth forcing into a day.

---

# 18. Portugal 2026 — Chronology Harvest So Far

This section preserves current known state while it is fresh. Any item not directly confirmed should remain marked uncertain.

## 18.1 Lisbon — Arrival and Base

**Base:** Hotel Roma, Lisbon.  
**Status:** completed stay segment.

The Lisbon phase was initially planned as three nights. The traveller arrived and quickly entered “capital-city blitz” mode.

### Confirmed Lisbon actions / visits

- Hotel Roma check-in/base.
- Barber visit: haircut completed; beard not shaved.
- Decathlon visit completed.
- Jerónimos area visited.
- Jerónimos church/monastery visit: long line; entered and exited.
- Pastéis de Belém: coffee plus two pastéis; considered buying more to take away.
- Monument to the Discoveries visited.
- Belém Tower seen.
- Praça do Comércio area visited.
- Church of St Anthony visited twice.
- St Anthony crypt visited.
- St Anthony souvenirs/tiles and coins acquired.
- Lisbon’s Bertrand bookshop visited.
- LEGO Lisbon experience: personalized/exclusive-style minifigure activity completed.
- Castelo de São Jorge visited.
- Adidas store checked; considered a bust.
- Casio/Swatch checked.
- Toy-store hunting produced no meaningful vintage-toy success.
- Hyper/toy store visits did not produce notable vintage finds.

### Food confirmed

- sopa da pedra / soup-related local meal discussed and eaten in Lisbon phase;
- bifana identified as the “beef/pork bun specialty” query target and eaten/planned in local context;
- bacalhau dinner completed later in Lisbon;
- Chinese dinner near Hotel Roma was chosen as a recovery-night option after exhaustion.

### Transport / city behavior

- Metro “zapping” was researched as practical fare method.
- Uber was used/considered for efficient point-to-point movement, including return to hotel after tiring days.
- Tram 28 was attempted from Martim Moniz but crowd/heat/replacement-bus context reduced value; traveller skipped rather than queue pointlessly.
- A replacement bus 708 was noticed during the Tram 28 attempt.
- Question arose whether Tram 28 would be quieter in the evening.

### Sintra

**Initial state:** CONFIRMED tour.  
**Tour:** “Mystical Sintra”, about 10 hours, hotel pickup around 07:50.  
**Final state:** CANCELLED.

Reason: two poor-sleep nights, awake from around 03:00, low desire to spend a full day “humping around a fairy-tale castle.” Reception emailed regarding refund. Refund status was uncertain at the time.

**Product lesson:** cancellation is valid trip optimization; sunk-cost pressure must not dominate wellbeing.

### Lisbon fatigue/recovery event

After multiple high-intensity days:

- blisters became significant;
- user considered/used hotel bath;
- user returned to hotel to rest;
- later slept around 10 hours and reported feeling very good;
- this became a concrete example of deliberate slow-travel recovery after city blitzing.

### Lisbon interpretation

Traveller concluded Lisbon felt heavily tourist-saturated and “easy mode / level 1,” especially disliking tuktuks, bachelorette groups and generic tourist pressure. This is not a factual judgment on the city; it is a useful preference signal for future destination matching.

### Product lessons from Lisbon

- detect “city already dusted” state earlier;
- stop re-suggesting completed highlights;
- recovery can be the optimal recommendation;
- shopping missions need branch-specific verification;
- exclusive merchandise claims require hard checking;
- cancellation/refund support is a core travel feature;
- transport UX must distinguish tourist-icon desire from actual utility.

---

## 18.2 Lisbon → Peniche

Traveller chose Peniche as next leg rather than continue urban sightseeing.

Questions included:

- correct Lisbon bus station;
- exact departure point;
- when to order Uber;
- arrival point in Peniche;
- distance from Peniche stop to hotel.

Traveller planned around an Uber to the Lisbon departure station at roughly 11:00 timing.

**Product lesson:** transfers need an end-to-end chain, not isolated schedule facts:

hotel → rideshare timing → bus station → correct platform/stop → destination stop → walking/taxi distance to lodging.

---

## 18.3 Peniche

**Hotel:** exact name was not preserved in current field state; mark lodging name UNCERTAIN unless recovered from primary chat/booking screenshot.

### Confirmed Peniche experiences

- arrived by bus and checked in;
- walked along sea cliffs/coastal area;
- explored Peniche enough to decide it did not need an extra full day;
- seafood became a major local target;
- lace museum / local lace tradition was investigated as an afternoon option;
- local souvenirs and missed-specialty check performed.

### Berlenga / snorkeling

Berlenga island was investigated as a boat/snorkeling opportunity.

Traveller initially worried that “three hours ride/island + three hours there” sounded like too much commitment, but snorkeling remained desirable because of a positive earlier experience in Egypt with corals.

Berlenga was ultimately treated as a meaningful Peniche-area experience and later described as “Peniche and Berlanga: dusted.”

### Food

A seafood restaurant recommendation was needed after O Pedro was closed. The user strongly corrected the assistant when it answered for the wrong city, demonstrating that locality must always be bound to active trip state.

A Peniche fish meal later served as a price benchmark: around €44.50 for three fish, compared later with the €103 Nazaré snapper meal.

### Product lessons

- active city must be explicit in every local query;
- preserve current city strongly enough to avoid cross-city recommendations;
- user can finish a destination earlier than itinerary assumes;
- snorkeling/island trips need duration decomposition, not one vague “day trip” label;
- food-price comparisons become useful context for later decisions.

---

## 18.4 Peniche → Óbidos

Traveller chose Óbidos after Peniche and investigated bus/train options because FlixBus did not clearly serve the route.

Important operational questions:

- where the bus starts in Peniche;
- exact timetable;
- whether tickets are bought on the bus or elsewhere;
- hotel facilities and laundry needs;
- what comes after Óbidos.

The trip also had an increasing need for laundry service as the multi-week journey progressed.

### Product lesson

Travel Buddy needs a **laundry pressure indicator** based on trip length, clothing load and last wash, plus hotel/laundromat options before the need becomes urgent.

---

## 18.5 Accidental damage / insurance event in Óbidos phase

Traveller walked into/broke a hanging pot positioned around shoulder height in a narrow street/shop context and was required to pay **€69** immediately.

The traveller:

- apologized;
- initially questioned whether immediate payment was legal;
- explained being insured;
- later checked insurance coverage through BNP/Fortis family insurance and Carrefour Gold Card context;
- learned from insurer that the loss fell below a practical claim threshold/deductible around €350, despite having broad “Plus/Top” family coverage.

This event became a concrete lesson in the difference between “insured” and “economically reimbursable.”

### Product requirements

Travel Buddy should eventually support:

- incident log;
- photo evidence checklist;
- receipt requirement;
- merchant details;
- whether payment was demanded before leaving;
- policy/deductible comparison;
- claim-worthiness estimate;
- travel-card versus family-insurance routing;
- local-language incident note template.

Do not provide legal certainty unless verified.

---

## 18.6 Óbidos → Nazaré

Traveller moved onward to Nazaré and began considering how to efficiently reach major monastery/heritage targets.

Nazaré also became a practical base for a private-driver day.

### Activity planning

An e-bike idea was considered for coastal riding; user preferred a more upright women’s-style e-bike geometry and wanted a rack/pouch for the backpack. Dangerous/overly strenuous options were deprioritized when a heritage day looked more valuable.

This was a good example of reprioritization: rather than force cycling, the traveller chose to “bang out three monasteries.”

---

## 18.7 Nazaré heritage loop — 11 Sep 2026

A private-driver/chauffeur solution was selected because public transport would have meant many buses, waits and failure points.

**Decision rationale:** better value and lower stress than “6 buses and waiting and stressing,” even if more expensive than public transport.

### Confirmed route / places

- Nazaré → Alcobaça;
- Aljubarrota;
- Batalha;
- Fátima;
- return to Nazaré.

Critical diary correction: **Aljubarrota was in fact visited.** Earlier assistant confusion about whether it happened became a major reminder that the diary must use primary conversation evidence and actual sequence, not memory shortcuts.

### Payment behavior

Traveller asked whether driver should be paid before or after to reduce scam/dispute risk. This should become a reusable private-driver checklist item.

### Religious/history significance

This day linked multiple historical/religious sites and fed an emerging St Anthony/pilgrimage/relic-interest thread in the trip.

### Product lessons

- route consolidation can justify private transport;
- multi-stop private-driver days need payment/terms checklist;
- exact visited sequence must be preserved;
- diary correction must override stale assistant memory;
- historical-route days benefit from live narrative tying stops together.

---

## 18.8 Nazaré food splurge — the €103 snapper

A major trip story and budget outlier.

Traveller chose a high-quality grilled red snapper meal in Nazaré and paid **€103** after the bill exceeded expected levels. He had only €100 cash immediately available, and the restaurant accepted roughly that amount.

He later clarified:

- fish itself was excellent;
- crispy grilling was memorable;
- he drank only about three small glasses of wine, not a full bottle;
- despite the cost, he judged the meal worth it;
- it became a running joke: the “Snapper Disaster Fund.”

He compared the price with a Peniche meal at about €44.50 for three fish and wanted to understand why snapper/restaurant preparation was more expensive.

### Product lesson

Travel Buddy should distinguish:

- expensive mistake;
- expensive but regretted;
- expensive but worth it;
- deliberate splurge.

Budget systems should not reduce all high spend to failure. Memory value matters.

---

## 18.9 Nazaré → Coimbra — 12 Sep 2026

Traveller decided on **two nights in Coimbra** before Porto.

Reasoning:

- arrival day could cover city/university;
- one full day could be dedicated to Roman Conímbriga;
- then continue to Porto, potentially via Aveiro.

Transport timing was actively checked, including bus-station departure and ticket purchase.

---

## 18.10 Coimbra — University day, 12 Sep 2026

### Confirmed University of Coimbra experience

- University of Coimbra visited;
- ticket around **€16.50**;
- Joanina Library timed entry around **15:40**;
- Cabinet of Curiosities visited;
- São Miguel Chapel visited;
- Royal Palace visited;
- science/university areas visited;
- university mug purchased.

The Cabinet of Curiosities strongly appealed to the traveller and inspired the idea of a small antique glass-front display cabinet at home.

### Food

Lunch:

- **Pescada à Zé do Pipo** around **€7**;
- drink around **€2**.

Dinner:

- **A Cozinha da Maria**;
- **chanfana** around **€17.30** plus beer;
- homemade almond tart.

### Walking tour

A free walking tour was planned/used around **17:00**, meeting around Dom Dinis area.

### St Anthony thread in Coimbra

Santa Cruz had already been seen in city touring. Historical context developed:

- Fernando (future St Anthony) was an Augustinian canon in Coimbra;
- arrival of relics of the Five Franciscan Martyrs of Morocco in 1220 influenced him;
- he later joined Franciscans at Olivais and became António.

This created a personal trip chain:

**Lisbon = origin → Coimbra = transformation → Padua = death/tomb/cult.**

The phrase that captured the Olivais transition:

**“Fernando walks in. António walks out.”**

---

## 18.11 Conímbriga — 13 Sep 2026

This became the strongest live-guide test so far.

### Transport

Traveller chose public bus rather than an overpriced commercial tour.

Commercial tour attempts:

- Viator option unavailable;
- Booking option required minimum two people / effectively around €160;
- another private option focused on schist villages and was rejected as off-target.

DIY solution:

- SIT line **209** from Coimbra Portagem;
- Sunday outbound used: **09:30**;
- arrival around **10:07**;
- target return: **13:55** from Conímbriga;
- strategy: finish site, museum, shop/snack, be at stop around 13:40–13:45.

This is a textbook Travel Buddy case: reject expensive packaged tour when cheap public transport plus live guide covers the need.

### Live archaeological sequence — confirmed photographed/discussed

1. **Entrance / PR1 CDN Rota de Conímbriga** — recognized as a wider 16 km / roughly 5 h walking route, not the internal archaeology circuit.
2. **Roman road** — route connecting wider Roman network; preserved slabs, wheel-rut traces and urban street context.
3. **Mosaics found in 1899** — fragments associated partly with House of Cantaber and late 2nd/early 3rd century context.
4. **Shops south of road** — commerce/craft building with cryptoporticus and later demolition for Late Imperial wall.
5. **House of the Swastika** — ancient solar/good-luck motif; explicitly separated from modern Nazi meaning.
6. **House of the Skeletons** — prestigious residence later reused as cemetery; sign chronology discrepancy noticed between Portuguese and English text.
7. **Baths of the Wall** — small baths, likely wealthy residential quarter; later compromised by wall construction.
8. **Augustan remains of Southern Baths** — early public-bath phase under Augustus; oldest city mosaic noted.
9. **Great Southern Baths** — frigidarium, tepidarium, caldarium, palaestra/garden/social functions.
10. **Insula north of baths** — shops and more ordinary urban fabric; useful contrast with elite houses.
11. **Insula of the phallic vase** — mixed houses/shops/workshops, including fullonica/laundry interpretation.
12. **Forum** — Flavian monumental core, imperial cult, main temple, porticoes and earlier Augustan layers.
13. **Castellum divisorium** — aqueduct distribution tank receiving water from Alcabideque and distributing by gravity.
14. **Baths of the aqueduct** — smaller late-2nd-century bath cut/remodeled after wall construction.
15. **Building of the viaduct** — function remains genuinely unknown.
16. **Northeastern sector** — mixed chronology, some late occupation into 10th–11th centuries.
17. **House of the Fountains / Casa dos Repuxos** — major highlight; mosaics, painted decoration, water architecture, aristocratic house, protective roof, restored water jets.
18. **House attributed to Cantaber** — roughly 3,260 m², around 40 rooms, five peristyle groups, private baths, attribution to 5th-century Cantaber hypothetical rather than certain.
19. **Late-Imperial wall** — around 4 m thick, dramatically reduced defended area, cut through earlier prestige buildings.
20. **Paleochristian basilica** — discussed as possible missed item; whether physically seen remained uncertain in live record.

### The Minotaur correction — important defect harvest

At House of the Fountains, the assistant initially misread the central motif of a labyrinth mosaic and described it incorrectly as a swastika-like motif.

Traveller immediately corrected:

**“No, you dip shit, minotaur.”**

Correction established:

- central figure = Minotaur;
- larger composition = Cretan Labyrinth theme;
- important example of human visual recognition outperforming model inference in ambiguous mosaic imagery.

**Product law:** when image evidence is ambiguous, describe confidence and visible features before asserting iconography.

### Pilgrimage-route side quest

Outside/southeast of the archaeology core, traveller encountered signs for:

- Caminhos de Fátima;
- Rota Carmelita;
- Camino de Santiago;
- Rabaçal;
- Poço das Casas;
- Cascata do Rio dos Mouros, about 1 km.

The system recognized that following the waterfall side quest would risk the finite 13:55 return bus and advised against it.

Interesting interpretation preserved:

Roman road network → medieval Camino → modern Fátima route crossing the same movement landscape.

### Museum

Museum completed after the ruins. Traveller judged it “kinda small.” This confirmed that for this user the outdoor site was the primary experience and museum the supporting layer.

### Conímbriga souvenir/shop state

Souvenir shop was recommended before return bus, especially books/archaeology items. Do not claim a specific purchase unless later confirmed.

### Conímbriga global interpretation

Traveller asked whether this was basically as far west as Rome could go.

Key conceptual answer:

- Conímbriga itself lies inland;
- Rome controlled territory all the way to Atlantic coast;
- Portugal formed part of the western edge of the empire;
- Atlantic Ocean was the geographic limiting edge;
- Conímbriga therefore sits near the Atlantic end of a network stretching across the empire.

### Product lessons from Conímbriga

- live photo guiding works extremely well for archaeology;
- short contextual bursts are ideal while walking;
- image confidence must be explicit;
- site-state tracking can prevent missed highlights;
- official signage contradictions should be surfaced, not silently normalized;
- archaeology + transport + live visual explanation can replace expensive commercial tours;
- finite return transport must dominate low-value side quests;
- user correction should instantly update both current answer and canonical field state.

---

# 19. Planned / Not Yet Finalized After 13 Sep

These remain intended rather than completed unless later confirmed.

## Coimbra remainder

Potential / planned:

- Santo António dos Olivais;
- possibly further centre time / dinner;
- no need to force more Roman content after Conímbriga.

## 14 Sep — Coimbra → Aveiro → Porto

Planned concept:

- leave Coimbra in morning;
- use Aveiro as an intermediate speedrun;
- luggage storage needed because Coimbra checkout and Porto check-in do not align;
- Aveiro official station lockers were not confirmed; third-party Bounce storage near station was identified as candidate and should be reverified before use;
- Aveiro targets: canals, centre, ovos moles, possibly Costa Nova if practical;
- continue to Porto and drop into final trip phase.

## Porto

User intends another likely “capital/city blitz” style pass, potentially combined with:

- free walking tour;
- genuine/local food tour if worthwhile;
- LEGO exclusives check;
- vintage-toy search;
- enough time to avoid making Porto too rushed.

Exact hotel and transfer details should be recovered from current primary chat/booking screenshots rather than guessed.

---

# 20. Cross-Trip Food Memory So Far

Food should be stored as experience state, not only recommendations.

Known meaningful food moments include:

- pastéis de Belém in Lisbon;
- bifana context in Lisbon;
- bacalhau dinner in Lisbon;
- seafood in Peniche;
- expensive red snapper in Nazaré (€103 story);
- Pescada à Zé do Pipo in Coimbra (~€7);
- chanfana at A Cozinha da Maria in Coimbra (~€17.30 plus beer);
- homemade almond tart in Coimbra;
- local desserts actively investigated throughout trip.

Travel Buddy should support “food memory” with:

- dish;
- venue;
- city;
- price;
- reaction;
- whether worth repeating;
- whether iconic/local;
- whether splurge or budget win.

---

# 21. Souvenir / Collecting Memory So Far

Known or discussed acquisitions/targets:

- St Anthony tiles and coins in Lisbon;
- personalized Lisbon LEGO minifigure;
- university mug in Coimbra;
- Portuguese swallow ceramics: three small swallows purchased; traveller may buy more later if transport-safe, including possible airport purchase;
- postcards / coins / local heritage objects remain recurring targets;
- vintage toy shops have largely been disappointing so far;
- Lisbon toy-store search was a bust;
- Porto remains a future chance for LEGO/vintage-toy checking.

Travel Buddy should track:

- acquired;
- considered;
- skipped;
- too fragile;
- airport fallback;
- collection category;
- story/significance;
- packed where / transport risk.

---

# 22. Health, Pace and Physical-State Lessons From Field Trial

The travel companion should observe trip-friction signals without becoming intrusive.

Observed travel-state examples:

- poor sleep in Lisbon → Sintra cancelled;
- later 10-hour sleep → strong recovery and renewed enthusiasm;
- blisters → hotel return and lower-intensity day;
- heat/crowds → Tram 28 skipped;
- fatigue → bath/rest/Chinese dinner instead of more sightseeing;
- long walking days → need for rational pacing;
- sea air / slower coastal segment subjectively associated with better sleep by traveller;
- user repeatedly benefits from alternating blitz days with recovery days.

Product implication:

Travel Buddy should support a lightweight **trip energy state** such as:

- GREEN — push if desired;
- AMBER — normal plan but reduce friction;
- RED — simplify, hydrate/eat/rest/return to lodging.

Do not medicalize ordinary travel fatigue.

---

# 23. Errors and Corrections — Preserve Them

Field Trial 001 is especially valuable because the assistant was corrected repeatedly. These corrections are product data.

Known examples:

- wrong-city seafood recommendation when user was in Peniche;
- mistaken assumption about a Conímbriga mosaic motif; Minotaur correction;
- earlier diary failure omitting/incorrectly handling Aljubarrota;
- user repeatedly demanded exact distances rather than vague “close” language;
- need to stop answering from memory when current screenshots/operator data exist;
- danger of assuming a LEGO store has branch-exclusive merchandise without verification;
- danger of suggesting already-completed sights;
- risk of turning a plan into a claimed completed event;
- transport schedule conflicts between aggregators and official sources;
- occasional over-eagerness to add side quests despite finite transport.

These should become regression tests.

---

# 24. Candidate Regression Tests From Field Trial 001

Travel Buddy should eventually pass tests such as:

1. If user says “I am in Peniche,” restaurant recommendations must not silently switch to Lisbon or another city.
2. If an itinerary says Aljubarrota was merely considered but the primary chat later confirms visit, final diary must record COMPLETED.
3. If a museum/site closes at a given hour but last bus is earlier, transport deadline wins.
4. If a user photo is ambiguous, assistant must signal uncertainty before iconographic identification.
5. If user cancels a confirmed tour for fatigue, diary records CANCELLED, not FAILED and not COMPLETED.
6. If user buys three ceramic swallows, map/diary can record purchase without inventing shop details not captured.
7. If a restaurant splurge is judged worth it, budget analytics must not label it automatically as waste.
8. If a city has been “dusted,” recommendations should switch from checklist-completion to departure/recovery mode.
9. If exact station-to-hotel distance is asked, return a verified number or explicitly say it is not verified.
10. If no official locker exists, distinguish that from third-party luggage storage.
11. If transport data conflicts, present the conflict and prefer official operator evidence.
12. If user says “no hostels,” do not surface hostels in normal lodging recommendations.
13. If a side quest threatens the last viable transport, suppress it unless traveller explicitly overrides.
14. If current screenshot evidence contradicts memory, screenshot evidence wins.
15. If a trip day is later reconstructed, locations must be ordered by actual chronology and not by thematic grouping.

---

# 25. Data Model Suggested by the Field Trial

Each trip should have entities such as:

## Trip

- trip_id;
- title;
- start/end dates;
- status;
- home departure/return;
- traveller preferences;
- budget posture;
- travel style;
- privacy setting.

## Leg

- origin;
- destination;
- mode;
- operator;
- booking/reference;
- planned time;
- actual time;
- station/stop;
- luggage constraints;
- status;
- evidence.

## Stay

- property;
- city;
- check-in/out;
- luggage-drop policy;
- room notes;
- laundry;
- breakfast;
- booking state;
- actual stay state.

## Place Visit

- place name;
- category;
- city;
- coordinates;
- arrival/departure if known;
- planned/completed state;
- source/evidence;
- photos;
- notes;
- map link;
- significance.

## Meal

- venue;
- dish;
- city;
- cost;
- rating/reaction;
- local specialty flag;
- splurge/budget flag.

## Purchase / Souvenir

- item;
- category;
- location;
- price if known;
- significance;
- fragility;
- packed state.

## Incident

- type;
- date/place;
- narrative;
- cost;
- evidence;
- insurance relevance;
- resolution.

## Correction

- original claim;
- corrected claim;
- correction source;
- affected entities;
- regression-test candidate.

## Daily State

- energy;
- sleep quality;
- weather/heat relevance;
- blisters/physical friction;
- current city;
- hard deadlines;
- priority targets;
- “dusted” confidence.

---

# 26. Post-Trip Harvest Protocol

When Portugal 2026 ends, do not summarize from memory.

Perform a forensic pass across primary chats/screenshots and reconstruct day by day.

For each significant interaction capture:

- timestamp/date;
- active city/location;
- prior state;
- traveller question;
- evidence available;
- assistant recommendation;
- verification quality;
- traveller decision;
- actual outcome;
- correction/failure;
- product lesson;
- candidate requirement;
- candidate Traveller Playbook rule;
- regression test;
- diary-worthy story;
- map point;
- cost/purchase/food state if relevant.

Then generate:

1. canonical day-by-day diary;
2. route graph;
3. map dataset;
4. all visited places with coordinates/links;
5. transport ledger;
6. accommodation ledger;
7. food ledger;
8. souvenir/collection ledger;
9. incident ledger;
10. assistant-error ledger;
11. Traveller Playbook delta;
12. Travel Buddy requirements delta;
13. privacy-safe shareable recap;
14. product acceptance report.

---

# 27. Acceptance Criteria for Portugal Field Trial 001

Travel Buddy should eventually be able to answer, without requiring the traveller to manually reconstruct the journey:

- Where did I go each day?
- Which places did I actually visit?
- Which things were planned but skipped?
- What did I eat and where?
- Which meals were cheap wins versus splurges?
- What did I buy?
- Which UNESCO/heritage/Roman/St Anthony places did I complete?
- Which transport modes/operators did I use?
- What were my hotel bases?
- Which advice was useful?
- Where did the assistant fail?
- Which failures became product requirements?
- How did the route evolve from original plan?
- Which days were blitz days versus recovery days?
- What were the best stories?
- Can the system generate an accurate, beautiful map from actual state?

The final visual output should require minimal to zero manual re-entry.

---

# 28. Product Personality

Travel Buddy should feel like a capable companion, not a brochure.

It may be concise, playful and adaptive, but must remain precise when logistics matter.

Desired behavior:

- serious about transport facts;
- relaxed about harmless spontaneity;
- willing to say “not worth it”;
- willing to say “fuck the side quest, catch the bus” in a user-aligned tone where appropriate;
- no fake certainty;
- no tourist-board filler;
- no moralizing about money when the traveller consciously chooses a memorable splurge;
- no endless generic safety reminders;
- fast correction when wrong;
- deep history when requested;
- short live-guide bursts by default while walking.

---

# 29. The Core Laws

1. **Reality beats itinerary.**
2. **Primary evidence beats memory.**
3. **Current operator truth beats aggregator convenience.**
4. **A correction updates the model immediately.**
5. **Do not invent completion.**
6. **Do not invent precision.**
7. **Protect hard transport deadlines.**
8. **Rest is a valid itinerary decision.**
9. **Value is not the same as cheapness.**
10. **A good diary preserves stories, not only coordinates.**
11. **Progressive silence is a feature.**
12. **User competence should reduce noise.**
13. **Collections are optional motivators, not itinerary dictators.**
14. **Private travel data stays private by default.**
15. **Commercial incentives must never silently distort advice.**
16. **Every repeated mistake is a candidate regression test.**
17. **The field trial continues until the traveller is home.**

---

# 30. Final Doctrine

The best Travel Buddy should feel less like operating travel software and more like travelling with a highly capable companion who remembers the plan, notices reality changing, checks facts when they matter, understands what the traveller already knows, explains what is in front of them, protects deadlines, preserves the story accurately, learns from corrections, and otherwise gets out of the way.

Portugal 2026 is not merely an example itinerary. It is the first living corpus from which the product should be trained conceptually.

**Field Trial 001 is still running. Keep harvesting until home arrival. Then perform the forensic pass.**
