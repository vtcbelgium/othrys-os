export function urlNormalize(input) {
  if (typeof input !== 'string') throw new TypeError('URL must be a string');
  let u;
  try { u = new URL(input); } catch { throw new TypeError('URL must be absolute'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new TypeError('Only http/https');
  u.hash = '';
  const entries = [...u.searchParams.entries()].sort(([ak,av],[bk,bv]) => ak < bk ? -1 : ak > bk ? 1 : av < bv ? -1 : av > bv ? 1 : 0);
  u.search = '';
  for (const [k,v] of entries) u.searchParams.append(k,v);
  let out = u.toString();
  if (u.pathname === '/' && !u.search) out = out.replace(/\/$/, '');
  return out;
}
