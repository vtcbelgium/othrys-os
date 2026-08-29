export const DIAGNOSTIC_PACKS=Object.freeze({
  quick:Object.freeze({label:'Penta Quick Check',description:'Core five-seat readiness, daily Prometheus and Frugal continuity.',tests:['runtime/os/pentarchy.test.mjs','runtime/os/prometheus_daily.test.mjs','runtime/os/prometheus_daily_loop.test.mjs','runtime/os/frugal_reserve.test.mjs']}),
  care:Object.freeze({label:'Care & Recovery',description:'Rhea care, Kronos life and Sclerotium recovery contracts.',tests:['runtime/os/rhea.test.mjs','runtime/os/kronos.test.mjs','runtime/os/sclerotium.test.mjs']}),
  intelligence:Object.freeze({label:'Knowledge & Intelligence',description:'Prometheus, Mnemosyne and context quality.',tests:['runtime/os/prometheus.test.mjs','runtime/os/prometheus_daily.test.mjs','runtime/os/prometheus_daily_loop.test.mjs','runtime/os/mnemosyne.test.mjs','runtime/os/mnemosyne_quality.test.mjs','runtime/os/context_metabolism.test.mjs']}),
  execution:Object.freeze({label:'Build & Execution',description:'Talos runtime, Work, Hephaestus and Switchyard contracts.',tests:['runtime/talos-kernel/loop.test.ts','runtime/os/work_record.test.mjs','runtime/os/switchyard.test.mjs','runtime/os/frugal_reserve.test.mjs']}),
  communications:Object.freeze({label:'Comms & Credentials',description:'Hermes and Keymaster fail-closed seams.',tests:['runtime/os/hermes.test.mjs','runtime/os/keymaster.test.mjs']}),
  deep:Object.freeze({label:'OTHRYS Deep Check',description:'Every native OS resident test plus Talos kernel.',glob:'runtime/os/*.test.mjs',extra:['runtime/talos-kernel/loop.test.ts']})
});

export function diagnosticCatalog(){
  return Object.freeze(Object.entries(DIAGNOSTIC_PACKS).map(([id,p])=>Object.freeze({id,label:p.label,description:p.description,settingsButtonReady:true,mutates:false,authorityGranted:false})));
}
