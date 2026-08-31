import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, 'docs', 'training', 'LEVEL_2_5_BLOCK_OWNERSHIP.json'), 'utf8'));

test('admitted reusable Block implementations do not live in OTHRYS OS', () => {
  assert.equal(manifest.canonicalRepository, 'vtcbelgium/othrys-blocks');
  assert.equal(manifest.osImplementationOwnership, false);
  for (const block of manifest.blocks) {
    assert.equal(existsSync(join(root, block.path)), false, `${block.path} duplicated back into OTHRYS OS`);
  }
});

test('four-repo estate resolves admitted Blocks from the canonical sibling when present', () => {
  const sibling = resolve(root, manifest.canonicalLocalSibling);
  if (!existsSync(sibling)) return;
  for (const block of manifest.blocks) {
    const packageFile = join(sibling, block.path, 'package.json');
    assert.equal(existsSync(packageFile), true, `${block.path} missing from othrys-blocks`);
    const pkg = JSON.parse(readFileSync(packageFile, 'utf8'));
    assert.equal(pkg.name, block.package);
    assert.equal(pkg.version, block.version);
  }
});
