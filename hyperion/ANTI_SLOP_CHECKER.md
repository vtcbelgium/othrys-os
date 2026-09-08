# HYPERION ANTI-SLOP CHECKER

Status: CANONICAL PRODUCT QUALITY FILTER
Owner: Hyperion
Purpose: prevent OTHRYS from wasting build capacity, deployment slots, maintenance budget, distribution effort, or operator attention on low-value generated junk.

## Prime directive

Cheap generation is not value.

OTHRYS must never confuse:
- output volume with progress;
- pages with products;
- traffic with useful demand;
- AI generation with differentiation;
- features with value;
- novelty with market worth;
- existing effort with future justification.

Hyperion is expected to be brutally honest.

> IF A PRODUCT DOES NOT DESERVE TO EXIST, KILL IT BEFORE IT BECOMES MAINTENANCE DEBT.

## 1. One-sentence existence test

Complete this sentence:

`This deserves to exist because __________________________.`

A PASS requires a concrete answer tied to user value or economic leverage.

Weak answers:
- because AI can build it;
- because competitors have one;
- because it might get traffic;
- because it looks cool;
- because we already spent time on it;
- because it adds another site to the portfolio.

Strong answers:
- completes the job in 20 seconds instead of 4 minutes;
- removes a mandatory account;
- processes files locally instead of uploading them;
- cuts the cost of a repeated workflow by 60%;
- gives evidence where incumbents provide an unsupported answer;
- serves a neglected niche with proven search demand;
- turns an existing OTHRYS capability into an almost zero-maintenance asset;
- creates strategically useful benchmark data while solving a real user problem.

If the sentence is vague: `KILL_OR_REDESIGN`.

## 2. Incumbent brutality test

Identify the best existing alternative.

Score OTHRYS against it on:
- task success;
- speed;
- steps/friction;
- price;
- privacy;
- mobile UX;
- batch support;
- export/portability;
- reliability;
- evidence/provenance;
- automation;
- integrations;
- support burden;
- maintenance burden;
- distribution fit.

If the incumbent is clearly better and OTHRYS has no credible near-term path to superiority:

`DO_NOT_SHIP`.

Being cheaper is not enough if the product is materially worse.
Being prettier is not enough if the job is slower.
Having AI is not an advantage by itself.

## 3. Minimum advantage threshold

Before public deployment, require at least one **material advantage**, preferably two or more.

Examples:
- >=2x faster;
- >=30% cheaper where cost matters;
- materially fewer steps;
- no account where incumbent requires one;
- no watermark;
- local/private processing;
- meaningful batch mode;
- better mobile completion rate;
- stronger export/portability;
- unique verified dataset;
- materially better evidence/provenance;
- automation of a repeated manual step;
- substantially better niche specialization;
- dramatically lower support burden;
- superior distribution wedge.

If no advantage can be measured or demonstrated: `SLOP_RISK_HIGH`.

## 4. Demand reality test

At least one demand signal should exist before meaningful build effort:
- visible search demand;
- incumbent traffic/usage;
- paid competitors;
- repeated complaints;
- repeated manual workaround;
- active marketplace category;
- recurring user request;
- direct evidence from OTHRYS usage;
- businesses spending money/time on the problem;
- known painful compliance/operational requirement.

No demand evidence does not always kill a cheap experiment, but it caps allowed build time and spend.

Rule:

`LOW_EVIDENCE -> TINY_EXPERIMENT_ONLY`.

## 5. Distribution test

Every public product must answer:

`How does the first stranger find this?`

Acceptable hypotheses:
- search query;
- plugin/extension marketplace;
- GitHub/package registry;
- existing OTHRYS audience;
- Prometheus/content loop;
- shareable result/report;
- public benchmark page;
- referral loop;
- directory;
- partner distribution;
- adjacent winning product.

If the answer is merely `we will post it`: distribution confidence is low.

If no plausible path exists, reduce build budget or kill.

## 6. Support trap test

Estimate human support required per 100 active users.

Penalize:
- installation calls;
- manual configuration;
- custom integration;
- recurring explanation;
- tenant-specific code;
- manual fulfillment;
- refunds caused by unclear scope;
- outputs requiring human correction;
- fragile external dependencies.

Preferred support ladder:

`DOCS -> PREFLIGHT -> SELF TEST -> EVIDENCE -> AUTO DIAGNOSIS -> AI/FAQ -> HUMAN ESCALATION ONLY`

If support scales linearly with users, it is probably not a good factory product.

## 7. Maintenance debt test

Before launch, estimate:
- dependency churn;
- security exposure;
- API/model dependency;
- data freshness needs;
- domain/certificate upkeep;
- legal/terms volatility;
- content update frequency;
- monitoring need;
- expected breakage rate;
- cost drift.

A EUR 5/month site that runs almost forever is acceptable.
A EUR 50/month site needing three hours/month is weak.

Core metric:

`NET_ASSET_VALUE = CASH + TRAFFIC + DATA + LEARNING + OPTIONALITY - RUN_COST - SUPPORT - MAINTENANCE - RISK - OPERATOR_ATTENTION`

If negative with no strategic reason: `RETIRE`.

## 8. AI-wrapper test

Automatic FAIL or redesign when the product is merely:

`textbox -> generic model call -> generic answer`

unless the surrounding system adds clear value through one or more of:
- proprietary/verified data;
- workflow automation;
- structured transformations;
- domain constraints;
- evidence/provenance;
- repeated memory;
- integration;
- evaluation;
- comparison;
- monitoring;
- lower cost routing;
- specialized UX;
- deterministic checks around AI output.

AI is an internal component, not the value proposition.

## 9. SEO-slop test

Reject pages whose primary purpose is to exist for keywords rather than users.

A page/tool must have standalone utility.

FAIL signals:
- paraphrased generic information;
- thousands of near-identical city/topic pages with no unique data/value;
- fake calculators with trivial math and excessive filler;
- autogenerated comparisons without current evidence;
- fabricated reviews;
- pages whose answer is worse than a normal search result;
- content generated only to host ads/affiliate links.

Good SEO is distribution for utility.
Bad SEO is pollution.

## 10. Grey-edge test

Hyperion should actively seek unconventional advantage, but every grey candidate receives a classification:

`WHITE | GREY_RESEARCH | RED_REJECT`

GREY_RESEARCH examples:
- unusual affiliate mechanics;
- shared savings;
- derived telemetry/intelligence;
- marketplace reuse;
- scraping/data reuse questions;
- white-label/repackaging rights;
- aggressive but truthful comparison claims;
- freemium cross-subsidy;
- sponsored free access;
- acquisition/resurrection of dormant assets.

RED_REJECT examples:
- fake users/reviews;
- undisclosed paid rankings;
- impersonation;
- prohibited scraping/access;
- bypassing platform limits;
- dark patterns;
- stolen/private data;
- hidden subscriptions;
- deceptive scarcity;
- rights violations;
- disguised income or transactions.

Law:

> LIVE NEAR THE EDGE BY UNDERSTANDING THE RULES BETTER, NOT BY PRETENDING THEY DO NOT EXIST.

## 11. Kill score

Score each 0-5:
- proven demand;
- user pain;
- measurable advantage;
- self-serve fit;
- distribution fit;
- margin potential;
- reuse;
- recurrence;
- data/learning value;
- strategic optionality;
- maintainability;
- OTHRYS verification advantage.

Subtract 0-5:
- support burden;
- maintenance burden;
- build cost;
- runtime cost;
- legal ambiguity;
- platform dependence;
- incumbent strength;
- commodity risk;
- trust risk.

Interpretation:
- `>=25`: strong experiment candidate;
- `15-24`: bounded cheap test only;
- `5-14`: redesign or archive;
- `<5`: kill;
- any trust/legal RED_REJECT: kill regardless of score.

The exact weights may evolve from portfolio evidence.

## 12. Vicious review questions

Before Hyperion gives oxygen, ask:
1. Who actually needs this?
2. How do we know?
3. What do they use now?
4. Why is that insufficient?
5. What is our measurable advantage?
6. Why can the incumbent not trivially copy the advantage?
7. How does a stranger discover us?
8. Can they get value without talking to us?
9. What does every 1,000 users cost?
10. What breaks first?
11. How much human attention does it consume?
12. What does it contribute if it earns only EUR 5/month?
13. What evidence tells us to kill it?
14. What evidence tells us to expand it?
15. Are we building a useful asset or generating content because generation is cheap?

## 13. Automatic retirement triggers

Recommend retirement/suspension when:
- no meaningful usage after defined test window;
- acquisition cost/effort exceeds expected value;
- repeated failures damage trust;
- support burden breaches limit;
- maintenance cost exceeds contribution;
- dependency/terms changes destroy economics;
- incumbent has decisively surpassed us with no counter-path;
- security/privacy risk becomes disproportionate;
- traffic is mostly bots/irrelevant;
- monetization harms utility more than it helps economics;
- better OTHRYS product subsumes the job.

Archive useful code/data before destruction.

## 14. Small compounder protection

Anti-slop is not anti-small.

Do not kill a small product merely because revenue is tiny.

Protect it if:
- users receive real value;
- it is reliable;
- burden is near zero;
- economics are non-negative;
- it contributes traffic/data/learning/portfolio leverage;
- OTHRYS can maintain it automatically.

`SMALL + USEFUL + CHEAP_TO_MAINTAIN` is a valid state.

`SMALL + USELESS + MAINTENANCE` is slop.

## Final laws

> NO PRODUCT HAS A RIGHT TO EXIST.

> GENERATION IS CHEAP. ATTENTION IS EXPENSIVE.

> IF THE INCUMBENT IS BETTER AND WE HAVE NO PATH TO BEAT IT, DO NOT SHIP A WORSE COPY.

> IF WE CANNOT EXPLAIN THE ADVANTAGE, THERE IS PROBABLY NO ADVANTAGE.

> SMALL COMPOUNDERS LIVE. MAINTENANCE DEBT DIES.

> MERCY FOR USERS. NO MERCY FOR WEAK PRODUCTS.

> HYPERION'S JOB IS NOT TO SAY YES. HYPERION'S JOB IS TO MAKE THE PORTFOLIO STRONGER.
