function isPlainObject(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null)}
function cell(v){
  if(v===null||v===undefined)return '';
  const t=typeof v;
  if(t==='object'||t==='function'||t==='symbol')throw new TypeError('unsupported cell');
  return String(v).replace(/\\/g,'\\\\').replace(/\|/g,'\\|').replace(/\r\n|\r|\n/g,'<br>');
}
export function markdownTable(records,options={}){
  if(!Array.isArray(records))throw new TypeError('records must be array');
  if(records.length===0)return '';
  for(const r of records)if(!isPlainObject(r))throw new TypeError('record must be plain object');
  let columns;
  if(options.columns!==undefined){
    if(!Array.isArray(options.columns)||options.columns.length===0)throw new RangeError('columns must be non-empty');
    columns=[...options.columns];
    const seen=new Set();
    for(const c of columns){if(typeof c!=='string'||c.length===0)throw new RangeError('bad column');if(seen.has(c))throw new RangeError('duplicate column');seen.add(c)}
  }else columns=[...new Set(records.flatMap(r=>Object.keys(r)))].sort();
  const row=vals=>'| '+vals.join(' | ')+' |';
  const lines=[row(columns),row(columns.map(()=> '---'))];
  for(const r of records)lines.push(row(columns.map(c=>cell(r[c]))));
  return lines.join('\n');
}
