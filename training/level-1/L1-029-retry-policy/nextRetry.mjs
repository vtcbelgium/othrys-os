const finite=(n,name)=>{if(typeof n!=='number'||!Number.isFinite(n))throw new TypeError(name+' must be finite')};
export function nextRetry({attempt,maxAttempts,baseDelayMs=1000,maxDelayMs=30000,multiplier=2,jitter=0}){
  finite(attempt,'attempt');finite(maxAttempts,'maxAttempts');finite(baseDelayMs,'baseDelayMs');finite(maxDelayMs,'maxDelayMs');finite(multiplier,'multiplier');finite(jitter,'jitter');
  if(!Number.isInteger(attempt)||attempt<1)throw new RangeError('attempt out of range');
  if(!Number.isInteger(maxAttempts)||maxAttempts<1)throw new RangeError('maxAttempts out of range');
  if(baseDelayMs<0||maxDelayMs<0)throw new RangeError('delay out of range');
  if(multiplier<1)throw new RangeError('multiplier out of range');
  if(jitter<0||jitter>1)throw new RangeError('jitter out of range');
  if(attempt>=maxAttempts)return Object.freeze({retry:false,nextAttempt:null,delayMs:null,reason:'MAX_ATTEMPTS'});
  let delay=Math.min(maxDelayMs,baseDelayMs*Math.pow(multiplier,attempt-1));
  delay=Math.min(maxDelayMs,delay*(1+jitter));
  return Object.freeze({retry:true,nextAttempt:attempt+1,delayMs:Math.round(delay),reason:'RETRY'});
}
