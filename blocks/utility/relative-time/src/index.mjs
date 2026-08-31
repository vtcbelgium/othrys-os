function parseIso(s){if(typeof s!=='string'||!s)throw new TypeError('INVALID_TIME');const ms=Date.parse(s);if(!Number.isFinite(ms))throw new TypeError('INVALID_TIME');return ms;}
export function relativeTimeLabel(thenIso,nowIso){
  const then=parseIso(thenIso), now=parseIso(nowIso); const sec=Math.floor((now-then)/1000); if(sec<0)throw new Error('FUTURE_TIME');
  if(sec<45)return 'just now';
  const min=Math.floor(sec/60); if(min<60)return `${min} minute${min===1?'':'s'} ago`;
  const hr=Math.floor(min/60); if(hr<24)return `${hr} hour${hr===1?'':'s'} ago`;
  const day=Math.floor(hr/24); if(day<7)return `${day} day${day===1?'':'s'} ago`;
  return thenIso.slice(0,10);
}
