#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const source = join(root, 'docs', 'ROOT_WORKSPACE_LAW.md');
const workspace = resolve(root, '..');
const expected = readFileSync(source, 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n';
const check = process.argv.includes('--check');
let drift = false;
for (const name of ['AGENTS.md', 'CLAUDE.md']) {
  const target = join(workspace, name);
  let actual = '';
  try { actual = readFileSync(target, 'utf8').replace(/\r\n/g, '\n'); } catch {}
  if (actual !== expected) {
    drift = true;
    if (!check) writeFileSync(target, expected, 'utf8');
    console.log(`${check ? 'DRIFT' : 'SYNCED'} ${target}`);
  } else console.log(`OK ${target}`);
}
if (check && drift) process.exitCode = 1;
