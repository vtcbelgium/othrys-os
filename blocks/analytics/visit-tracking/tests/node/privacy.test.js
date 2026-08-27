import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../../src');

function scanFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

test('N10: Scan src for forbidden vtc fallback, SUPABASE_SERVICE_KEY, and default salts', () => {
  const files = scanFiles(srcDir);
  assert.ok(files.length > 0, 'Should find src files to scan');

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Forbidden: hardcoded fallback 'vtc' salt string or pattern
    assert.equal(
      content.includes("'vtc'") || content.includes('"vtc"'),
      false,
      `File ${file} contains forbidden "vtc" fallback string`
    );
    assert.equal(
      content.includes('ANALYTICS_SALT ||'),
      false,
      `File ${file} contains forbidden fallback logic for salt`
    );
    
    // Forbidden: referencing SUPABASE_SERVICE_KEY in core block logic
    assert.equal(
      content.includes('SUPABASE_SERVICE_KEY'),
      false,
      `File ${file} contains forbidden SUPABASE_SERVICE_KEY token`
    );
  }
});
