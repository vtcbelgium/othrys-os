const RX=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
function parse(v){
  if(typeof v!=='string') throw new TypeError('version must be a string');
  const m=RX.exec(v); if(!m) throw new RangeError('invalid SemVer');
  const pre=m[4]??null;
  if(pre) for(const id of pre.split('.')) if(/^\d+$/.test(id)&&id.length>1&&id[0]==='0') throw new RangeError('numeric prerelease leading zero');
  return {core:[BigInt(m[1]),BigInt(m[2]),BigInt(m[3])],pre:pre?pre.split('.'):null};
}
const cmp=(a,b)=>a<b?-1:a>b?1:0;
export function compareSemver(a,b){
  const x=parse(a),y=parse(b);
  for(let i=0;i<3;i++){const c=cmp(x.core[i],y.core[i]);if(c)return c;}
  if(x.pre===null&&y.pre===null)return 0;
  if(x.pre===null)return 1;if(y.pre===null)return -1;
  const n=Math.max(x.pre.length,y.pre.length);
  for(let i=0;i<n;i++){
    if(i===x.pre.length)return -1;if(i===y.pre.length)return 1;
    const A=x.pre[i],B=y.pre[i],an=/^\d+$/.test(A),bn=/^\d+$/.test(B);
    if(an&&bn){const c=cmp(BigInt(A),BigInt(B));if(c)return c;continue;}
    if(an!==bn)return an?-1:1;
    const c=cmp(A,B);if(c)return c;
  }
  return 0;
}
