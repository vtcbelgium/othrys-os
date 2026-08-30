export function csvClean(input) {
  if (input === '') return '';

  let rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let justClosed = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < input.length && input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
          justClosed = true;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\r' && i + 1 < input.length && input[i + 1] === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (char === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }
  }

  if (inQuotes) {
    throw new SyntaxError('Unterminated quoted field');
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.map(r => r.map(f => {
    if (/[,"\r\n]/.test(f)) {
      return `"${f.replace(/"/g, '""')}"`;
    }
    return f;
  }).join(',')).join('\n');
}
