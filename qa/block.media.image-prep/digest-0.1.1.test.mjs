/**
 * 0.1.1 digest proof — added by V2-001D.
 *
 * This does NOT replace digest.test.mjs. That file is the 0.1.0-era proof and is
 * deliberately left untouched: two of its three tests now fail by design, because
 * the specimen moved to 0.1.1 and its tamper detector is correctly saying so.
 * Both histories are preserved (V2-001D section 7).
 *
 * Known limitation, recorded as DIGEST_CANONICALIZATION_PENDING: the admitted
 * procedure hashes WORKING-TREE bytes, so this reproduces only on a checkout that
 * materialises line endings the same way (CRLF on Windows). True of 0.1.0 too.
 * Not solved here.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const V2_ROOT = "C:\\Users\\othry\\Projects\\othrys-v2";
const BLOCK_ROOT =
  "C:\\Users\\othry\\Projects\\othrys-blocks\\blocks\\media\\image-prep";
const ACTIVE_ADMISSION = path.join(
  V2_ROOT,
  "admissions",
  "block.media.image-prep@0.1.1.json",
);
const SUPERSEDED_ADMISSION = path.join(
  V2_ROOT,
  "admissions",
  "block.media.image-prep@0.1.0.json",
);
const ACTIVE_DIGEST =
  "48afa7ac082db75b40278bf71ff552f6ff0ca4e1429006f759dec4c37b3b55bd";
const SUPERSEDED_DIGEST =
  "32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function walkFiles(root, current = root) {
  const paths = [];
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join("/");
    if (entry.isDirectory()) {
      if (["node_modules", "test-results", ".git"].includes(entry.name)) continue;
      paths.push(...(await walkFiles(root, absolute)));
    } else if (entry.isFile()) {
      paths.push(relative);
    }
  }
  return paths;
}

async function manifestEntries() {
  const files = (await walkFiles(BLOCK_ROOT)).sort((a, b) =>
    Buffer.from(a).compare(Buffer.from(b)),
  );
  return Promise.all(
    files.map(async (relative) => ({
      path: relative,
      sha256: sha256(await readFile(path.join(BLOCK_ROOT, ...relative.split("/")))),
    })),
  );
}

function treeDigest(entries) {
  const manifest = entries.map((entry) => `${entry.sha256}  ${entry.path}\n`).join("");
  return sha256(Buffer.from(manifest, "utf8"));
}

test("live specimen matches the ACTIVE 0.1.1 admission manifest and tree digest", async () => {
  const admission = JSON.parse(await readFile(ACTIVE_ADMISSION, "utf8"));
  const actual = await manifestEntries();
  assert.equal(admission.block_version, "0.1.1");
  assert.equal(admission.admission_status, "ACTIVE_ADMITTED");
  assert.deepEqual(actual, admission.package_tree_digest.manifest);
  assert.equal(actual.length, 14);
  assert.equal(treeDigest(actual), admission.package_tree_digest.value);
  assert.equal(treeDigest(actual), ACTIVE_DIGEST);
});

test("0.1.1 digest computation is deterministic across repeated reads", async () => {
  const observed = [];
  for (let index = 0; index < 10; index += 1) {
    observed.push(treeDigest(await manifestEntries()));
  }
  assert.equal(new Set(observed).size, 1);
  assert.equal(observed[0], ACTIVE_DIGEST);
});

test("the live specimen is no longer 0.1.0, and 0.1.0's record is intact", async () => {
  const superseded = JSON.parse(await readFile(SUPERSEDED_ADMISSION, "utf8"));
  assert.equal(superseded.block_version, "0.1.0");
  assert.equal(superseded.package_tree_digest.value, SUPERSEDED_DIGEST);
  assert.notEqual(ACTIVE_DIGEST, SUPERSEDED_DIGEST);
  assert.notEqual(treeDigest(await manifestEntries()), SUPERSEDED_DIGEST);
});

test("exactly six of the fourteen files differ from the 0.1.0 manifest", async () => {
  const superseded = JSON.parse(await readFile(SUPERSEDED_ADMISSION, "utf8"));
  const old = new Map(
    superseded.package_tree_digest.manifest.map((e) => [e.path, e.sha256]),
  );
  const actual = await manifestEntries();
  const changed = actual.filter((e) => old.get(e.path) !== e.sha256).map((e) => e.path);
  assert.deepEqual(changed, [
    "BLOCK.md",
    "package.json",
    "src/config.js",
    "src/prepareImage.js",
    "tests/browser/image-prep.spec.js",
    "tests/node/contract.test.js",
  ]);
  assert.equal(actual.length - changed.length, 8);
});

test("a one-byte-equivalent manifest tamper is detected without touching the Block", async () => {
  const actual = await manifestEntries();
  const tampered = actual.map((entry, index) =>
    index === 0
      ? { ...entry, sha256: `${entry.sha256.slice(0, -1)}${entry.sha256.endsWith("0") ? "1" : "0"}` }
      : entry,
  );
  assert.notEqual(treeDigest(tampered), treeDigest(actual));
});
