const LENGTH=Object.freeze({mm:0.001,cm:0.01,m:1,km:1000,in:0.0254,ft:0.3048,yd:0.9144,mi:1609.344});
const MASS=Object.freeze({mg:1e-6,g:1e-3,kg:1,oz:0.028349523125,lb:0.45359237});
const TEMP=new Set(['C','F','K']);
const dim=u=>Object.hasOwn(LENGTH,u)?'length':Object.hasOwn(MASS,u)?'mass':TEMP.has(u)?'temp':null;
export function convertUnit(value,from,to){
  if(typeof value!=='number'||!Number.isFinite(value)) throw new TypeError('value must be finite number');
  const a=dim(from),b=dim(to); if(!a||!b) throw new RangeError('invalid unit'); if(a!==b) throw new RangeError('cross-dimension conversion');
  let out;
  if(a==='length') out=value*LENGTH[from]/LENGTH[to];
  else if(a==='mass') out=value*MASS[from]/MASS[to];
  else {
    const c=from==='C'?value:from==='F'?(value-32)*5/9:value-273.15;
    out=to==='C'?c:to==='F'?c*9/5+32:c+273.15;
  }
  if(!Number.isFinite(out)) throw new RangeError('nonfinite result');
  return Object.is(out,-0)?0:out;
}
