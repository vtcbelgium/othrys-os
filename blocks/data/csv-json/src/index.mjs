export function csvToJson(input) {
  if (!input || input.length === 0) return [];

  const lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length === 0) return [];

  const headers = parseLine(lines[0]);
  if (headers.length === 0) throw new RangeError('Empty header row');
  if (new Set(headers).size !== headers.length) throw new RangeError("Duplicate header");

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '') continue;
    const fields = parseLine(lines[i]);
    if (fields.length !== headers.length) {
      throw new RangeError(`Row ${i + 1} has ${fields.length} fields, expected ${headers.length}`);
    }
    const record = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      let value = fields[j];
      if (value === null || value === undefined) {
        value = '';
      } else {
        value = String(value);
      }
      record[header] = value;
    }
    records.push(Object.freeze(record));
  }

  return records;
}

function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        fields.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  fields.push(current);
  return fields;
}

export function jsonToCsv(records) {
  if (records.length === 0) return '';

  const firstRecord = records[0];
  const headers = Object.keys(firstRecord);

  for (let i = 1; i < records.length; i++) {
    const record = records[i];
    const keys = Object.keys(record);
    if (keys.length !== headers.length) {
      throw new RangeError(`Row ${i + 1} has ${keys.length} keys, expected ${headers.length}`);
    }
    for (let j = 0; j < headers.length; j++) {
      if (!record.hasOwnProperty(headers[j])) {
        throw new RangeError(`Row ${i + 1} missing key '${headers[j]}'`);
      }
    }
  }

  const lines = [];
  lines.push(headers.join(','));

  for (const record of records) {
    const fields = headers.map(header => {
      let value = record[header];
      if (value === null || value === undefined) {
        value = '';
      } else {
        value = String(value);
      }
      return quoteField(value);
    });
    lines.push(fields.join(','));
  }

  return lines.join('\n');
}

function quoteField(field) {
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}
