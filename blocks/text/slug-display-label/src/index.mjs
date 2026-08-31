export const isSlugLike = s => typeof s === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(s);
export function slugDisplayLabel(idOrSlug,{fallback='Unknown'}={}){
  let s=String(idOrSlug??'');
  const m=s.match(/(?:^|-)\d{4}-(.+)$/); if(m) s=m[1];
  const label=s.split('-').filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  return label || fallback;
}
export function chooseDisplayLabel(name,idOrSlug,options){return name && !isSlugLike(name) ? name : slugDisplayLabel(idOrSlug ?? name,options);}
