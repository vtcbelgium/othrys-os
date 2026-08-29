from pathlib import Path
import json
root=Path('.')
entries=[
 {'id':'othrys-os','title':'The Book of OTHRYS OS','role':'The current house: one operating surface over proven V2 machinery.','evidence':['OTHRYS_OS_NORTH_STAR.md','.othrys/project.json','V2-010A','V2-010F'],'legacy':['othrys-core/books/book-of-othrys/README.md'],'boundary':'This book maps the house; it grants no authority and does not rename historical V2 provenance.'},
 {'id':'gpt','title':'The Book of GPT Control','role':'Roadmap/control owner that issues bounded missions and preserves the next legal action.','evidence':['BOOK_OF_GPT.md','GPT_STATE.json','GPT_RAILS.md'],'legacy':[],'boundary':'GPT Control plans and governs; it does not self-verify or bypass Trust Canal.'},
 {'id':'hephaestus','title':'The Book of Hephaestus','role':'Engineering authority for bounded construction under mission scope.','evidence':['V2-002F','.othrys/project.json#authorities/hephaestus'],'legacy':['othrys-core/titan/hephaestus/DIRECTIVE.md'],'boundary':'Hephaestus builds; it does not ratify evidence, memory, or constitutional authority.'},
 {'id':'talos','title':'The Book of Talos','role':'Independent verification and evidence authority.','evidence':['V2-002B','.othrys/project.json#authorities/talos'],'legacy':['othrys-core/titan/talos/DIRECTIVE.md'],'boundary':'Talos verifies and closes evidence gates; builder success alone is never proof.'},
 {'id':'trust-canal','title':'The Book of Trust Canal','role':'Admission and authority boundary for intents and execution progression.','evidence':['V2-002E','V2-010D','.othrys/project.json#systems/trust-canal'],'legacy':[],'boundary':'No operating mode, UI action, model, or Book can grant authority around Trust Canal.'},
 {'id':'factory','title':'The Book of Factory','role':'Oros/product build and refine surface over proven capabilities.','evidence':['V2-005D','.othrys/project.json#systems/factory'],'legacy':['othrys-hub Factory mission evidence in Mnemosyne estate'],'boundary':'Factory composes and refines candidates; operator acceptance and governed release remain separate.'},
 {'id':'mycelium','title':'The Book of Mycelium','role':'Colony and node routing across OTHRYS machines.','evidence':['V2-004D','.othrys/project.json#systems/mycelium'],'legacy':['temp/mycelium/BOOK_OF_MYCELIUM_ADDENDUM_DISTRIBUTED_COLONY.md'],'boundary':'Mycelium routes work; it does not create mission authority or trust a node by presence alone.'},
 {'id':'command-deck','title':'The Book of Command Deck','role':'Operator workstation and tablet-first control surface.','evidence':['V2-006E','V2-009B','.othrys/project.json#systems/command-deck'],'legacy':['docs/PANDAOS-HARVEST/PANDAOS_V2_HARVEST_REPORT_2026-08-27.md'],'boundary':'Presentation may expose authority; presentation never becomes authority.'},
 {'id':'mnemosyne','title':'The Book of Mnemosyne','role':'Knowledge governance and institutional memory over explicit evidence.','evidence':['V2-010E','V2-010G','.othrys/project.json#knowledgePolicy'],'legacy':['othrys-core/books/book-of-mnemosyne/README.md','othrys-core/titan/mnemosyne/**'],'boundary':'Mnemosyne admits, classifies, relates, searches, reviews and preserves; it does not research, build, execute, or silently promote.'},
 {'id':'atlas','title':'The Book of Atlas','role':'Derived read-only knowledge/system map over Mnemosyne and V2 evidence.','evidence':['V2-010F','.othrys/project.json#atlasPolicy'],'legacy':['othrys-core/titan/atlas/README.md'],'boundary':'Atlas is a workspace/read model, not a Titan, registry, or authority.'},
 {'id':'missions-work','title':'The Book of Missions and Work','role':'Mission is canonical execution intent; Work is its durable OS orchestration projection.','evidence':['V2-010B','missions/**','.othrys/work/**'],'legacy':['great-library/book/14-missions.md in estate'],'boundary':'Work may organize slices/stages/tasks but cannot replace Mission, Trust Canal, Talos, or receipts.'},
 {'id':'blocks','title':'The Book of Blocks','role':'Admitted reusable capability units composed under exact identity and proof.','evidence':['V2-001F','V2-001G','V2-001I','blocks/**'],'legacy':['LEGACY_INVENTORY.md Block stock'],'boundary':'A Block is not a loose helper or UI feature; unproven stock cannot masquerade as an admitted capability.'},
 {'id':'oroi-projects','title':'The Book of Oroi and Projects','role':'Project-local OTHRYS OS objects composed from proven roles, capabilities, knowledge and integrations.','evidence':['V2-010A','V2-010C','.othrys/project.json'],'legacy':['OTHRYS_OS_NORTH_STAR.md'],'boundary':'A project manifest is declarative and cannot grant execution authority.'},
 {'id':'models','title':'The Book of Models and Labor','role':'Replaceable model labor exposed through current project model policy.','evidence':['V2-002C','V2-004D','.othrys/project.json#modelPolicy'],'legacy':['Switchyard prototype is deferred stock only'],'boundary':'Model identity is labor, not authority. Switchyard is not yet a resident system and this Book must not claim otherwise.'},
]
books=root/'books'; books.mkdir(exist_ok=True)
registry={'schema':'othrys.os.book-registry.v1','status':'HOUSEKEEPING_BASELINE','laws':['Books synthesize evidence; they do not replace code, tests, ADRs, missions, receipts or history.','Every current house authority/system/service/structural surface has exactly one Book target.','Quarry stock is cited as provenance and is not promoted by citation.','Book changes grant no execution authority.'], 'books':[]}
for e in entries:
    if e['id']=='gpt': path='BOOK_OF_GPT.md'
    else: path=f"books/book-of-{e['id']}/README.md"
    registry['books'].append({**e,'path':path,'status':'CURRENT_OS_EDITION'})
    if e['id']=='gpt': continue
    d=root/f"books/book-of-{e['id']}"; d.mkdir(parents=True,exist_ok=True)
    lines=[f"# {e['title']}","",'**Status:** OTHRYS OS housekeeping edition — evidence-bound, non-authoritative by itself.',"",'## Purpose',e['role'],"",'## Current house law',e['boundary'],"",'## Canonical evidence']
    lines += [f"- `{x}`" for x in e['evidence']]
    lines += ["",'## Preserved quarry / provenance']
    lines += ([f"- `{x}`" for x in e['legacy']] or ['- No separate legacy source required for this edition.'])
    lines += ["",'## Book rule','This Book may be expanded only from inspectable implementation, tests, mission results, receipts, ADRs, or reviewed Mnemosyne evidence. Contradictions are recorded; history is never silently rewritten.',""]
    (d/'README.md').write_text('\n'.join(lines),encoding='utf8')
(books/'BOOK_REGISTRY.json').write_text(json.dumps(registry,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
readme=['# The OTHRYS OS House Shelf','', 'This is the current OTHRYS OS edition of the Books shelf. It extends the older OTHRYS Book law without replacing preserved Core/Hub books.','', 'A Book is institutional memory, not execution authority. Current code/tests/missions/receipts remain the proof source.','', '## Current shelf']
for b in registry['books']:
    readme.append(f"- **{b['title']}** — `{b['path']}` — {b['role']}")
readme += ['', '## Admission rule','A new Book target enters this shelf only when the corresponding house surface already exists in repo truth. Planned Titans/services remain quarry or roadmap until separately admitted.', '']
(books/'README.md').write_text('\n'.join(readme),encoding='utf8')
print('BOOKS_WRITTEN',len(entries))
