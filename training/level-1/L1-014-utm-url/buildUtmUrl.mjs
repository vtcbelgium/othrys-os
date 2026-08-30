export function buildUtmUrl(input, campaign) {
  if (typeof input !== 'string') throw new TypeError('URL must be a string');
  let u; try { u = new URL(input); } catch { throw new TypeError('URL must be absolute'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new TypeError('Only http/https');
  if (!campaign || typeof campaign !== 'object' || Array.isArray(campaign)) throw new TypeError('campaign must be object');
  const allowed=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  for (const k of Object.keys(campaign)) if (!allowed.includes(k)) throw new RangeError(`Unknown campaign field: ${k}`);
  const required=['utm_source','utm_medium','utm_campaign'];
  for (const k of required) {
    const v = campaign[k] == null ? '' : String(campaign[k]).trim();
    if (!v) throw new RangeError(`${k} required`);
  }
  for (const k of allowed) u.searchParams.delete(k);
  for (const k of allowed) {
    if (!(k in campaign)) continue;
    const v = campaign[k] == null ? '' : String(campaign[k]).trim();
    if (required.includes(k) || v) u.searchParams.set(k,v);
  }
  u.hash='';
  const entries=[...u.searchParams.entries()].sort(([ak,av],[bk,bv])=>ak<bk?-1:ak>bk?1:av<bv?-1:av>bv?1:0);
  u.search=''; for (const [k,v] of entries) u.searchParams.append(k,v);
  return u.toString();
}
