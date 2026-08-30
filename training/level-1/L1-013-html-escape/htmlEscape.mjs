export function htmlEscape(input) {
  const str = (input == null ? '' : String(input));
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '&') {
      result += '&amp;';
    } else if (ch === '<') {
      result += '&lt;';
    } else if (ch === '>') {
      result += '&gt;';
    } else if (ch === '"') {
      result += '&quot;';
    } else if (ch === "'") {
      result += '&#39;';
    } else {
      result += ch;
    }
  }
  return result;
}

export function htmlUnescape(input) {
  const str = (input == null ? '' : String(input));
  let result = '';
  let i = 0;
  while (i < str.length) {
    if (str[i] === '&') {
      let j = str.indexOf(';', i + 1);
      if (j === -1) {
        result += '&';
        i++;
        continue;
      }
      const entity = str.slice(i + 1, j);
      let decoded = '';
      if (entity === 'amp') {
        decoded = '&';
      } else if (entity === 'lt') {
        decoded = '<';
      } else if (entity === 'gt') {
        decoded = '>';
      } else if (entity === 'quot') {
        decoded = '"';
      } else if (entity === '#39') {
        decoded = "'";
      } else if (entity.startsWith('#x')) {
        const hex = entity.slice(2).toUpperCase();
        try {
          decoded = String.fromCharCode(parseInt(hex, 16));
        } catch (e) {
          decoded = '&' + entity + ';';
        }
      } else if (/^#(\d+)$/.test(entity)) {
        const num = parseInt(entity.slice(1), 10);
        if (!isNaN(num)) {
          decoded = String.fromCharCode(num);
        } else {
          decoded = '&' + entity + ';';
        }
      } else {
        decoded = '&' + entity + ';';
      }
      result += decoded;
      i = j + 1;
    } else {
      result += str[i];
      i++;
    }
  }
  return result;
}
