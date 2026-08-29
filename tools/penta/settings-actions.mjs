export const SETTINGS_ACTIONS=Object.freeze([
  {id:'penta-quick',label:'Run Penta Check',command:['node','tools/penta/run-diagnostics.mjs','quick'],kind:'TEST',mutates:false},
  {id:'othrys-deep',label:'Run Deep Check',command:['node','tools/penta/run-diagnostics.mjs','deep'],kind:'TEST',mutates:false},
  {id:'care-check',label:'Run Care Check',command:['node','tools/penta/run-diagnostics.mjs','care'],kind:'TEST',mutates:false},
  {id:'intelligence-check',label:'Run Intelligence Check',command:['node','tools/penta/run-diagnostics.mjs','intelligence'],kind:'TEST',mutates:false},
  {id:'execution-check',label:'Run Execution Check',command:['node','tools/penta/run-diagnostics.mjs','execution'],kind:'TEST',mutates:false},
  {id:'comms-check',label:'Run Comms Check',command:['node','tools/penta/run-diagnostics.mjs','communications'],kind:'TEST',mutates:false},
  {id:'prometheus-daily-check',label:'Test Daily Prometheus',command:['node','--test','runtime/os/prometheus_daily.test.mjs','runtime/os/prometheus_daily_loop.test.mjs'],kind:'TEST',mutates:false},
  {id:'frugal-check',label:'Test Free Frugal',command:['node','--test','runtime/os/frugal_reserve.test.mjs'],kind:'TEST',mutates:false},
  {id:'whole-body',label:'Run Whole OTHRYS',command:['node','tools/penta/whole-body.mjs'],kind:'TEST',mutates:false},
  {id:'penta-benchmark',label:'Benchmark Penta',command:['node','tools/penta/benchmark.mjs','20000'],kind:'BENCHMARK',mutates:false},
  {id:'penta-loop-10',label:'Run 10x Loop',command:['node','tools/penta/soak.mjs','10','quick'],kind:'SOAK',mutates:false},
  {id:'penta-loop-100',label:'Run 100x Loop',command:['node','tools/penta/soak.mjs','100','quick'],kind:'SOAK',mutates:false}
].map(x=>Object.freeze({...x,authorityGranted:false,executionStarted:false})));

if(import.meta.url===`file://${process.argv[1]?.replace(/\\/g,'/')}`) console.log(JSON.stringify({schema:'othrys.os.settings-actions.v1',actions:SETTINGS_ACTIONS},null,2));

