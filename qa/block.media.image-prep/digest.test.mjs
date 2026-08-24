import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const V2_ROOT = "C:\\Users\\othry\\Projects\\othrys-v2";
const BLOCK_ROOT =
  "C:\\Users\\othry\\Projects\\othrys-blocks\\blocks\\media\\image-prep";
const ADMISSION_PATH = path.join(
  V2_ROOT,
  "admissions",
  "block.media.image-prep@0.1.0.json",
);

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function admittedRecord() {
  return JSON.parse(await readFile(ADMISSION_PATH, "utf8"));
}

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

test("canonical 14-file specimen matches the admitted manifest and tree digest", async () => {
  const admission = await admittedRecord();
  const actual = await manifestEntries();
  assert.deepEqual(actual, admission.package_tree_digest.manifest);
  assert.equal(actual.length, 14);
  assert.equal(treeDigest(actual), admission.package_tree_digest.value);
});

test("digest computation is deterministic across repeated reads", async () => {
  const observed = [];
  for (let index = 0; index < 10; index += 1) {
    observed.push(treeDigest(await manifestEntries()));
  }
  assert.equal(new Set(observed).size, 1);
  assert.equal(
    observed[0],
    "32b34548ad2dcd31c81d6efc5b569e0f19f33943e621f910f2f07b15ad363d7b",
  );
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
