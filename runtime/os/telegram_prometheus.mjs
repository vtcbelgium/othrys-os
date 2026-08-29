const clean=v=>typeof v==='string'?v.trim():'';
const OP=/^PO-[0-9a-f]{20}$/;
export function createTelegramPrometheusPayload(report){
  if(!report||report.schema!=='othrys.os.prometheus-daily-report.v1') throw new Error('TELEGRAM_PROM_REPORT_REQUIRED');
  const keyboard=[];
  for(const card of report.actionCards??[]){
    if(!OP.test(card.opportunityId)) throw new Error('TELEGRAM_PROM_OPPORTUNITY_INVALID');
    keyboard.push([{text:`ADD · ${clean(card.title).slice(0,42)}`,callback_data:`prom:add:${card.opportunityId}`},{text:'DENY',callback_data:`prom:deny:${card.opportunityId}`}]);
  }
  return Object.freeze({schema:'othrys.os.telegram-prometheus-payload.v1',text:report.message.slice(0,3800),reply_markup:Object.freeze({inline_keyboard:Object.freeze(keyboard.map(r=>Object.freeze(r.map(Object.freeze))))}),parse_mode:null,disable_web_page_preview:true,requiresHermesAdapter:true,deliveryStarted:false,authorityGranted:false,executionStarted:false});
}

export function parseTelegramPrometheusCallback(data){
  const m=clean(data).match(/^prom:(add|deny):(PO-[0-9a-f]{20})$/); if(!m) throw new Error('TELEGRAM_PROM_CALLBACK_INVALID');
  return Object.freeze({schema:'othrys.os.prometheus-opportunity-callback.v1',decision:m[1]==='add'?'ADD':'DENY',opportunityId:m[2],answerCallbackRequired:true,authorityGranted:false,executionStarted:false});
}
