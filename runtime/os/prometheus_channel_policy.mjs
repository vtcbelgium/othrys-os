export const PROMETHEUS_REPORT_CHANNELS=Object.freeze(['GPT_ONLY','TELEGRAM','OTHRYS_APP','BOTH']);
export function resolvePrometheusReportChannel({preference='GPT_ONLY',telegramReady=false,appReady=false}={}){
  const requested=String(preference).trim().toUpperCase(); if(!PROMETHEUS_REPORT_CHANNELS.includes(requested)) throw new Error('PROM_REPORT_CHANNEL_INVALID');
  const effective=requested==='TELEGRAM'&&!telegramReady?'GPT_ONLY':requested==='OTHRYS_APP'&&!appReady?'GPT_ONLY':requested==='BOTH'&&!telegramReady&&!appReady?'GPT_ONLY':requested;
  const blockers=[]; if(['TELEGRAM','BOTH'].includes(requested)&&!telegramReady)blockers.push('TELEGRAM_NOT_READY');if(['OTHRYS_APP','BOTH'].includes(requested)&&!appReady)blockers.push('OTHRYS_APP_NOT_READY');
  return Object.freeze({schema:'othrys.os.prometheus-report-channel.v1',requested,effective,telegramReady:Boolean(telegramReady),appReady:Boolean(appReady),blockers:Object.freeze(blockers),gptExistingFlowPreserved:true,authorityGranted:false,executionStarted:false});
}
