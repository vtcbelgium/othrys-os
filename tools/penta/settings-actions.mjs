export const SETTINGS_ACTIONS=Object.freeze([
  {id:'penta-status',label:'Penta Status',command:['node','tools/penta/status.mjs'],kind:'STATUS',mutates:false},
  {id:'penta-faults',label:'Test Penta Faults',command:['node','tools/penta/fault-matrix.mjs'],kind:'TEST',mutates:false},
  {id:'penta-quick',label:'Run Penta Check',command:['node','tools/penta/run-diagnostics.mjs','quick'],kind:'TEST',mutates:false},
  {id:'othrys-deep',label:'Run Deep Check',command:['node','tools/penta/run-diagnostics.mjs','deep'],kind:'TEST',mutates:false},
  {id:'care-check',label:'Run Care Check',command:['node','tools/penta/run-diagnostics.mjs','care'],kind:'TEST',mutates:false},
  {id:'intelligence-check',label:'Run Intelligence Check',command:['node','tools/penta/run-diagnostics.mjs','intelligence'],kind:'TEST',mutates:false},
  {id:'library-check',label:'Check Great Library',command:['node','tools/penta/run-diagnostics.mjs','library'],kind:'TEST',mutates:false},
  {id:'execution-check',label:'Run Execution Check',command:['node','tools/penta/run-diagnostics.mjs','execution'],kind:'TEST',mutates:false},
  {id:'comms-check',label:'Run Comms Check',command:['node','tools/penta/run-diagnostics.mjs','communications'],kind:'TEST',mutates:false},
  {id:'prometheus-daily-check',label:'Test Daily Prometheus',command:['node','--test','runtime/os/prometheus_daily.test.mjs','runtime/os/prometheus_daily_loop.test.mjs'],kind:'TEST',mutates:false},
  {id:'blood-check',label:'Test Prometheus Blood Loop',command:['node','tools/penta/run-diagnostics.mjs','blood'],kind:'TEST',mutates:false},
  {id:'keymaster-inventory',label:'Check Keymaster Arsenal',command:['node','tools/penta/keymaster-inventory.mjs'],kind:'STATUS',mutates:false},
  {id:'keymaster-live-health',label:'Check API Health',command:['node','tools/penta/keymaster-live-health.mjs'],kind:'STATUS',mutates:false},
  {id:'frugal-check',label:'Test Free Frugal',command:['node','--test','runtime/os/frugal_reserve.test.mjs','runtime/os/free_capacity.test.mjs','runtime/os/free_resource_quarry.test.mjs'],kind:'TEST',mutates:false},
  {id:'free-inventory',label:'Check Free Capacity',command:['node','tools/penta/local-free-inventory.mjs'],kind:'STATUS',mutates:false},
  {id:'self-hone',label:'Self-Hone OTHRYS',command:['node','tools/penta/self-hone.mjs'],kind:'TEST',mutates:false},
  {id:'whole-body',label:'Run Whole OTHRYS',command:['node','tools/penta/whole-body.mjs'],kind:'TEST',mutates:false},
  {id:'penta-benchmark',label:'Benchmark Penta',command:['node','tools/penta/benchmark.mjs','20000'],kind:'BENCHMARK',mutates:false},
  {id:'penta-loop-10',label:'Run 10x Loop',command:['node','tools/penta/soak.mjs','10','quick'],kind:'SOAK',mutates:false},
  {id:'penta-loop-100',label:'Run 100x Loop',command:['node','tools/penta/soak.mjs','100','quick'],kind:'SOAK',mutates:false}
].map(x=>Object.freeze({...x,authorityGranted:false,executionStarted:false})));

if(import.meta.url===`file://${process.argv[1]?.replace(/\\/g,'/')}`) console.log(JSON.stringify({schema:'othrys.os.settings-actions.v1',actions:SETTINGS_ACTIONS},null,2));
