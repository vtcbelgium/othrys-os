const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function buildSitemapXml(baseUrl,paths){
  let base; try{base=new URL(baseUrl);}catch{throw new TypeError('INVALID_BASE_URL');}
  if(!['http:','https:'].includes(base.protocol)||base.pathname!=='/'||base.search||base.hash) throw new TypeError('INVALID_BASE_URL');
  if(!Array.isArray(paths)||paths.some(p=>typeof p!=='string'||!p.startsWith('/'))) throw new TypeError('INVALID_PATHS');
  const seen=new Set(), urls=[]; for(const p of paths){if(seen.has(p))continue;seen.add(p);urls.push(`  <url><loc>${esc(new URL(p,base).href)}</loc></url>`);}
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
