export function compactNumber(value){
  const n=Number(value??0); if(!Number.isFinite(n)) throw new TypeError('INVALID_NUMBER');
  const sign=n<0?'-':'', a=Math.abs(n);
  if(a>=1e9)return sign+(a/1e9).toFixed(1).replace(/\.0$/,'')+'B';
  if(a>=1e6)return sign+(a/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if(a>=1e3)return sign+(a/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return String(n);
}
