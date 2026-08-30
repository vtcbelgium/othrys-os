const ALLOWED=new Set(['required','type','minLength','pattern']);
const TYPES=new Set(['string','number','boolean','array','object']);
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
export function checkSchema(value,rules){
  if(!plain(value)||!plain(rules)) throw new TypeError('value and rules must be plain objects');
  const issues=[];
  for(const [field,rule] of Object.entries(rules)){
    if(!plain(rule)) throw new TypeError('rule must be plain object');
    for(const k of Object.keys(rule)) if(!ALLOWED.has(k)) throw new RangeError('unknown rule key');
    if(rule.required!==undefined&&typeof rule.required!=='boolean') throw new TypeError('required must be boolean');
    if(rule.type!==undefined&&!TYPES.has(rule.type)) throw new RangeError('invalid type rule');
    if(rule.minLength!==undefined&&(!Number.isInteger(rule.minLength)||rule.minLength<0)) throw new RangeError('invalid minLength');
    let rx=null;if(rule.pattern!==undefined){if(typeof rule.pattern!=='string')throw new TypeError('pattern must be string');try{rx=new RegExp(rule.pattern)}catch{throw new RangeError('invalid pattern')}}
    const present=Object.prototype.hasOwnProperty.call(value,field)&&value[field]!==null&&value[field]!==undefined;
    if(!present){if(rule.required)issues.push(Object.freeze({field,code:'MISSING'}));continue;}
    const v=value[field];
    if(rule.type){const ok=rule.type==='array'?Array.isArray(v):rule.type==='object'?plain(v):typeof v===rule.type;if(!ok){issues.push(Object.freeze({field,code:'TYPE'}));continue;}}
    if(rule.minLength!==undefined&&(typeof v==='string'||Array.isArray(v))&&v.length<rule.minLength)issues.push(Object.freeze({field,code:'MIN_LENGTH'}));
    if(rx&&typeof v==='string'&&!rx.test(v))issues.push(Object.freeze({field,code:'PATTERN'}));
  }
  return Object.freeze(issues);
}
