#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const EXPECTED = Object.freeze({
  block_id: "block.media.image-prep",
  block_version: "0.1.1",
  package: "@othrys-blocks/media-image-prep",
  package_tree_digest: "48afa7ac082db75b40278bf71ff552f6ff0ca4e1429006f759dec4c37b3b55bd",
  relative_path: "blocks/media/image-prep",
});

function fail(code, message, detail = {}) {
  console.log(JSON.stringify({ ok: false, code, message, ...detail }));
  process.exitCode = 2;
}
function sha256(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
function walk(root, dir = root, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name); const st = statSync(p);
    const rel = relative(root, p).split(sep).join("/");
    if (rel.split("/").some((x) => ["node_modules", "test-results", ".git"].includes(x))) continue;
    if (st.isDirectory()) walk(root, p, out); else if (st.isFile()) out.push(rel);
  }
  return out;
}function treeDigest(blockDir) {
  const files = walk(blockDir).sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  const lines = files.map((rel) => `${sha256(readFileSync(join(blockDir, rel)))}  ${rel}\n`).join("");
  return { file_count: files.length, digest: sha256(Buffer.from(lines, "utf8")), files };
}

const argv = process.argv.slice(2);
const rootArg = argv[argv.indexOf("--v2-root") + 1];
if (!rootArg || argv.indexOf("--v2-root") === -1) {
  fail("INVALID_ARGS", "--v2-root is required");
} else {
  const v2Root = resolve(rootArg);
  const blockDir = join(v2Root, EXPECTED.relative_path);
  if (!existsSync(blockDir)) {
    fail("BLOCK_MISSING", `canonical V2 Block is absent: ${blockDir}`, { v2Root, blockDir });
  } else {
    const actualTree = treeDigest(blockDir);
    if (actualTree.digest !== EXPECTED.package_tree_digest || actualTree.file_count !== 14) {
      fail("DIGEST_MISMATCH", "canonical V2 Block bytes do not match the admitted specimen", {
        expected_digest: EXPECTED.package_tree_digest,
        actual_digest: actualTree.digest,
        file_count: actualTree.file_count,
      });
    } else {
      const pkg = JSON.parse(readFileSync(join(blockDir, "package.json"), "utf8"));
      const mod = await import(`${pathToFileURL(join(blockDir, "src", "index.js")).href}?verify=${Date.now()}`);
      const identity = { block_id: mod.BLOCK_ID, block_version: mod.BLOCK_VERSION, package: pkg.name };
      if (identity.block_id !== EXPECTED.block_id || identity.block_version !== EXPECTED.block_version || identity.package !== EXPECTED.package) {
        fail("IDENTITY_MISMATCH", "executable/package identity does not match the frozen V2-001G specimen", { expected: EXPECTED, actual: identity });
      } else {        const lockIndex = argv.indexOf("--lock");
        let lock = null;
        if (lockIndex !== -1) {
          const lockPath = resolve(argv[lockIndex + 1]);
          lock = JSON.parse(readFileSync(lockPath, "utf8"));
          const rb = lock.resolved_blocks?.[0] ?? {};
          const mismatches = [];
          for (const key of ["block_id", "block_version", "package", "package_tree_digest"]) {
            if (rb[key] !== EXPECTED[key]) mismatches.push(`${key}:${String(rb[key])}`);
          }
          if (rb.provenance?.path !== EXPECTED.relative_path) mismatches.push(`path:${String(rb.provenance?.path)}`);
          if (mismatches.length) {
            fail("LOCK_MISMATCH", "oros.lock record disagrees with the frozen/observed composition", { mismatches });
          }
        }
        if (!process.exitCode) {
          console.log(JSON.stringify({
            ok: true,
            code: "MOUNT_VERIFIED",
            v2_root: v2Root,
            block_dir: blockDir,
            identity,
            package_tree_digest: actualTree.digest,
            file_count: actualTree.file_count,
            lock_checked: Boolean(lock),
            legacy_fallback: false,
          }));
        }
      }
    }
  }
}