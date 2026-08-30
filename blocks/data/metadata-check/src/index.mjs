const TYPES=new Set(['string','number','boolean','array','object']);
const isPlain=o=>o&&typeof o==='object'&&!Array.isArray(o)&&(Object.getPrototypeOf(o)===Object.prototype||Object.getPrototypeOf(o)===null);
export function checkMetadata(metadata,schema){
  if(!isPlain(metadata)||!isPlain(schema)) throw new TypeError('metadata/schema must be plain objects');
  for(const [field,rule] of Object.entries(schema)){
    if(!isPlain(rule)) throw new TypeError(`rule ${field} must be object`);
    if(rule.type!==undefined&&!TYPES.has(rule.type)) throw new RangeError(`unsupported type ${rule.type}`);
    for(const k of ['minLength','maxLength']) if(rule[k]!==undefined&&(!Number.isInteger(rule[k])||rule[k]<0)) throw new RangeError(`${k} invalid`);
    if(rule.pattern!==undefined){if(typeof rule.pattern!=='string') throw new TypeError('pattern must be string');try{new RegExp(rule.pattern)}catch{throw new RangeError('pattern invalid')}}
  }
  const missing=[],invalid=[];
  for(const field of Object.keys(schema)){
    const rule=schema[field], present=Object.prototype.hasOwnProperty.call(metadata,field)&&metadata[field]!=null;
    if(rule.required===true&&!present){missing.push(field);continue}
    if(!present) continue;
    const v=metadata[field];
    if(rule.type){const actual=Array.isArray(v)?'array':(isPlain(v)?'object':typeof v);if(actual!==rule.type){invalid.push(Object.freeze({field,reason:'type'}));continue}}
    if(rule.minLength!==undefined&&(typeof v==='string'||Array.isArray(v))&&v.length<rule.minLength){invalid.push(Object.freeze({field,reason:'minLength'}));continue}
    if(rule.maxLength!==undefined&&(typeof v==='string'||Array.isArray(v))&&v.length>rule.maxLength){invalid.push(Object.freeze({field,reason:'maxLength'}));continue}
    if(rule.pattern!==undefined&&typeof v==='string'&&!new RegExp(rule.pattern).test(v)){invalid.push(Object.freeze({field,reason:'pattern'}));continue}
  }
  return Object.freeze({valid:missing.length===0&&invalid.length===0,missing:Object.freeze(missing),invalid:Object.freeze(invalid)});
}
