import { writeFileSync } from 'node:fs';
const rows=[
['H1','Work State state machine','BACKEND_RECOVERY_PROVEN',['runtime/os/work_record.mjs','runtime/os/work_recovery.mjs'],'Durable Work, transitions and atomic checkpoint restart recovery are proven; UI cancellation controls remain later.','EXPOSE_UI_LATER'],
['H2','Gate taxonomy','MATCHED_STRONGER',['runtime/os/operating_mode.mjs','runtime/os/evidence_contract.mjs'],'OTHRYS separates authority/policy from Talos evidence; keep one vocabulary and avoid a second gate engine.','CONSOLIDATE_VOCABULARY'],
['H3','Intervention policy','IMPLEMENTED_NATIVE',['runtime/os/intervention_policy.mjs'],'Operator prompt frequency now varies without changing Trust/Talos law.','DONE_BACKEND'],
['H4','Atlas -> Mnemosyne','MATCHED_STRONGER',['runtime/os/mnemosyne.mjs','runtime/os/mnemosyne_quality.mjs','runtime/os/atlas_model.mjs'],'Typed admission, explicit files, review, provenance and maintenance exist; contradiction UX/export presentation remains later.','UI_LATER'],
['H5','Repeated procedure -> skill','IMPLEMENTED_NATIVE',['runtime/os/procedure_skill_proposal.mjs','runtime/os/skill_contract.mjs'],'Three-plus repeated successful procedures can become Garden candidates; direct Block admission remains forbidden.','DONE_BACKEND'],
['H6','Local semantic search','QUALIFIED_NATIVE',['runtime/os/local_semantic_search.mjs','docs/V2-011J/LOCAL_SEARCH_BENCHMARK_WARM.json'],'embeddinggemma earned 12/12 top-1 on a live bounded benchmark and a V2-native Ollama embedding adapter now exists.','DONE_BACKEND'],
['H7','Model tier requests','MATCHED_STRONGER',['runtime/os/switchyard.mjs','runtime/os/frugal_reserve.mjs','runtime/os/free_capacity.mjs'],'Capability/tier/cost/locality/health/certification routing already exceeds Panda reference.','EXPOSE_UI_LATER'],
['H8','Project composition','BACKEND_READY_UI_PENDING',['runtime/os/project_manifest.mjs','runtime/os/project_materializer.mjs'],'Project roles, authorities, systems, capabilities, integrations, knowledge and model policy are declarative.','UI_LATER']];
rows.push(
['H9','Project-local control files','MATCHED_STRONGER',['.othrys/project.json','books/BOOK_REGISTRY.json'],'Git-native project truth and Books are already inspectable/versionable; hidden UI state is not canonical.','KEEP'],
['H10','Progress surface','BACKEND_READY_UI_PENDING',['runtime/os/work_projection.mjs','runtime/os/work_record.mjs'],'Objective/scope/risks/owners/artifacts/transitions are projected; visual surface comes after OS closeout.','UI_LATER'],
['H11','Permission UX','BACKEND_READY_UI_PENDING',['runtime/os/operating_mode.mjs','runtime/os/intervention_policy.mjs'],'Observe/Plan/Supervised/Autonomous policy and prompt cadence are explicit; UI wording is not built yet.','UI_LATER'],
['H12','Evidence artifact declaration','IMPLEMENTED_NATIVE',['runtime/os/evidence_contract.mjs','runtime/os/work_record.mjs'],'Expected evidence can be frozen before execution and remains Talos-gated.','DONE_BACKEND'],
['H13','Resumability','BACKEND_RECOVERY_PROVEN',['runtime/os/work_recovery.mjs','runtime/os/sclerotium.mjs'],'Atomic checkpoint restart read-back plus stale approval, partial artifact, drift and cancellation faults are proven fail-closed.','DONE_BACKEND'],
['H14','Integration/source boundaries','IMPLEMENTED_NATIVE',['runtime/os/integration_classes.mjs','.othrys/project.json'],'Canonical APP / INTEGRATION / ENGINE / SOURCE vocabulary is implemented; live integrations carry additive canonicalClass metadata.','DONE_BACKEND'],
['H15','Local connection','MATCHED_STRONGER',['runtime/os/switchyard.mjs','runtime/os/free_capacity.mjs','.othrys/project.json'],'Legion/T590/local Ollama and remote execution stock already exist under bounded routing.','EXPOSE_UI_LATER'],
['H16','Visual/computer-use bridge','PARTIAL_GATED',['runtime/os/visual_control.mjs'],'Observe/evidence comparison is admitted; supervised input and autonomous control remain intentionally refused.','QUALIFY_SUPERVISED_LATER']
);const map=rows.map(([id,name,status,evidence,delta,action])=>({id,name,status,evidence,delta,action,authorityGranted:false,executionStarted:false}));
const steps=[
{step:1,name:'OS Shell / information architecture',status:'BACKEND_READY_UI_PENDING',need:'Truthful shell only; no backend rebuild.'},
{step:2,name:'Work / Mission Control',status:'BACKEND_STRONG',need:'Recovery semantics are proven; visual controls remain later.'},
{step:3,name:'Team + Skills',status:'BACKEND_READY',need:'Expose Titans, Blocks and Skill Contracts later.'},
{step:4,name:'Knowledge / Atlas',status:'BACKEND_STRONG',need:'UI/review ergonomics later; no new memory engine.'},
{step:5,name:'Models / Switchyard',status:'BACKEND_STRONGER_THAN_REFERENCE',need:'Expose routing reasons/health/cost later.'},
{step:6,name:'Mycelium + Visual Control',status:'PARTIAL_GATED',need:'Node projection exists; supervised visual input still needs qualification.'},
{step:7,name:'Apps / Integrations / Engines + Factory',status:'BACKEND_STRONG',need:'Canonical integration classes exist; prove one governed external-engine path in a later execution mission.'},
{step:8,name:'Autonomous operations',status:'NOT_YET',need:'Requires live cadence plus bounded self-originated maintenance mission evidence.'}
];
const missing=map.filter(x=>['MISSING_QUALIFICATION','PARTIAL','PARTIAL_GATED','PARTIAL_STRONG'].includes(x.status));
const out={schema:'othrys.os.panda-closed-catalogue-gap-map.v1',generatedAt:new Date().toISOString(),reference:'PandaOS harvest docs only; experience patterns, never backend authority',h1ToH16:map,steps,missingCount:missing.length,missing:missing.map(x=>x.id),uiWorkStarted:false,authorityGranted:false,executionStarted:false};
writeFileSync('docs/V2-011J/PANDAOS_CLOSED_CATALOGUE_GAP_MAP.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({rows:map.length,missing:out.missing,steps:steps.map(x=>[x.step,x.status])},null,2));