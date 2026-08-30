export const KEYMASTER_PROVIDER_QUARANTINE=Object.freeze({
  TOGETHER_API_KEY:Object.freeze({providerId:'together',reason:'INVALID_CREDENTIAL',since:'2026-08-30',healthExcluded:true,routingExcluded:true}),
  FIREWORKS_API_KEY:Object.freeze({providerId:'fireworks',reason:'ACCOUNT_ACTION_REQUIRED',since:'2026-08-30',healthExcluded:true,routingExcluded:true})
});
export function providerQuarantine(envVar){return KEYMASTER_PROVIDER_QUARANTINE[envVar]??null;}
export function activeHealthRows(rows){return rows.filter(row=>!row.quarantined);}
