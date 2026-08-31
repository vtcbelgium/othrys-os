const finiteNonneg=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
export function cappedGrant(requested,cap,used=0){
  if(!finiteNonneg(requested)||!finiteNonneg(cap)||!finiteNonneg(used)) throw new TypeError('INVALID_AMOUNT');
  const remaining=Math.max(0,cap-used);
  const granted=Math.max(0,Math.min(requested,remaining));
  return Object.freeze({requested,cap,used,remaining,granted,capped:granted<requested});
}
