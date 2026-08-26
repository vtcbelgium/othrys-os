#!/usr/bin/env node
// ---------------------------------------------------------------------------
// oros-zero-image-prep — child runner for `media.image.prepare` (PENTA-001).
//
// Executes the V2-canonical Block `block.media.image-prep@0.1.1` inside the ONE
// environment where it is proven to work: the Block's own Playwright/Chromium
// harness (`blocks/media/image-prep/tests/browser/`), re-proven in V2-001F and V2-001G, with
// real Chromium.
//
// It adds NOTHING to the Block. It does not copy the Block, does not patch it,
// does not install a Node canvas, and writes no file inside the Block source. The
// harness is started on an ephemeral loopback port so a concurrent
// `npm run test:browser` on the Block's own default port 4177 is never disturbed.
//
// Protocol — one JSON job on stdin, one JSON result as the LAST stdout line:
//   in : { blocksRepo, sourcePath, outputPath, operations[], config{}, profile?, timeoutMs }
//   out: { ok:true,  prepared{}, output{path,sha256,byteLength}, runner{} }
//        { ok:false, code, message }
//
// `code` uses the Block's own ERROR_CODES when the Block raised
// (decode_failed · unsupported_type · encode_failed · canvas_unavailable);
// otherwise a runner code (harness_unavailable · harness_failed · timeout).
//
// Local only. No network beyond 127.0.0.1. No secrets. €0.
// ---------------------------------------------------------------------------

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";

const BLOCK_ERROR_CODES = new Set([
  "unsupported_type",
  "decode_failed",
  "encode_failed",
  "canvas_unavailable",
]);

function emit(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}

function fail(code, message) {
  emit({ ok: false, code, message });
  process.exit(0); // the RESULT carries the failure; the exit code does not.
}

async function readJob() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) throw new Error("no job on stdin");
  return JSON.parse(raw);
}

/** An ephemeral free loopback port, so the Block's own 4177 stays untouched. */
function freePort() {
  return new Promise((res, rej) => {
    const srv = createServer();
    srv.on("error", rej);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });
}

async function waitForHarness(url, deadlineMs) {
  const until = Date.now() + deadlineMs;
  let lastErr = "";
  while (Date.now() < until) {
    try {
      const r = await fetch(url, { method: "GET" });
      if (r.ok) return true;
      lastErr = `HTTP ${r.status}`;
    } catch (e) {
      lastErr = e?.message ?? String(e);
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  throw new Error(`harness did not come up at ${url}: ${lastErr}`);
}

async function main() {
  let job;
  try {
    job = await readJob();
  } catch (e) {
    fail("harness_failed", `bad job: ${e.message}`);
    return;
  }

  const blocksRepo = resolve(job.blocksRepo);
  const blockDir = join(blocksRepo, "blocks", "media", "image-prep");
  const serveScript = join(blockDir, "tests", "browser", "serve.mjs");
  if (!existsSync(serveScript)) {
    fail("harness_unavailable", `Block harness not found at ${serveScript}`);
    return;
  }

  // Resolve Playwright from this exact Block package, never repo root or legacy quarry.
  let chromium;
  try {
    const requireFromBlock = createRequire(join(blockDir, "package.json"));
    chromium = requireFromBlock("playwright").chromium;
  } catch (e) {
    fail(
      "harness_unavailable",
      `playwright is not installed in ${blockDir} (${e.message}). Run: npm install --prefix "${blockDir}"`
    );
    return;
  }

  const port = await freePort();
  const url = `http://127.0.0.1:${port}/`;

  const server = spawn(process.execPath, [serveScript], {
    cwd: blockDir,
    env: { ...process.env, IMAGE_PREP_HARNESS_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverErr = "";
  server.stderr?.on("data", (d) => {
    serverErr += String(d);
  });

  let browser = null;
  const cleanup = async () => {
    try {
      if (browser) await browser.close();
    } catch {
      /* ignore */
    }
    try {
      server.kill("SIGKILL");
    } catch {
      /* ignore */
    }
  };

  try {
    await waitForHarness(url, 15_000);
  } catch (e) {
    await cleanup();
    fail("harness_unavailable", `${e.message}. server stderr: ${serverErr.slice(-500)}`);
    return;
  }

  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    await cleanup();
    fail(
      "canvas_unavailable",
      `Chromium could not launch (${e.message}). Run: npx --prefix "${blockDir}" playwright install chromium`
    );
    return;
  }

  const startedAt = Date.now();
  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on("pageerror", (e) => consoleErrors.push(String(e?.message ?? e)));

    await page.goto(url, { waitUntil: "load", timeout: 20_000 });
    await page.waitForFunction(() => window.__imagePrepReady === true, null, { timeout: 20_000 });

    const blockIdInPage = await page.evaluate(() => window.BLOCK_ID);

    const sourceB64 = readFileSync(job.sourcePath).toString("base64");

    const evaluated = await page.evaluate(
      async ({ b64, mime, operations, config, profile }) => {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        // The Block accepts a Blob/File. The media type is the one the upstream
        // load step sniffed, so a decode failure is the IMAGE's failure and never
        // an artefact of an untyped `data:application/octet-stream` URL.
        const blob = new Blob([bytes], { type: mime });
        try {
          const opts = { operations, config };
          if (profile) opts.profile = profile;
          const out = await window.prepareImage(blob, opts);
          const buf = new Uint8Array(await out.blob.arrayBuffer());
          let s = "";
          for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
          return {
            ok: true,
            prepared: {
              width: out.width,
              height: out.height,
              format: out.format,
              bboxTrimmed: out.bboxTrimmed,
              backgroundRemoved: out.backgroundRemoved,
              durationMs: out.durationMs,
              operationsApplied: out.operationsApplied,
              blockId: out.blockId,
            },
            outB64: btoa(s),
          };
        } catch (e) {
          return {
            ok: false,
            code: e && e.code ? String(e.code) : "decode_failed",
            message: e && e.message ? String(e.message) : String(e),
            name: e && e.name ? String(e.name) : "Error",
          };
        }
      },
      {
        b64: sourceB64,
        mime: job.sourceMime ?? "application/octet-stream",
        operations: job.operations ?? ["square"],
        config: job.config ?? {},
        profile: job.profile ?? null,
      },
    );

    if (!evaluated.ok) {
      await cleanup();
      const code = BLOCK_ERROR_CODES.has(evaluated.code) ? evaluated.code : "decode_failed";
      fail(code, `${IMAGE_PREP_LABEL(evaluated)} ${evaluated.message}`);
      return;
    }

    const outBytes = Buffer.from(evaluated.outB64, "base64");
    mkdirSync(dirname(job.outputPath), { recursive: true });
    writeFileSync(job.outputPath, outBytes);

    emit({
      ok: true,
      prepared: evaluated.prepared,
      output: {
        path: job.outputPath,
        sha256: createHash("sha256").update(outBytes).digest("hex"),
        byteLength: outBytes.byteLength,
      },
      runner: {
        engine: "playwright",
        browser: "chromium",
        harnessUrl: url,
        harnessPort: port,
        blockIdInPage,
        pageErrors: consoleErrors,
        wallMs: Date.now() - startedAt,
      },
    });
    await cleanup();
    process.exit(0);
  } catch (e) {
    await cleanup();
    fail("harness_failed", `browser run failed: ${e?.message ?? e}`);
  }
}

function IMAGE_PREP_LABEL(ev) {
  return `${ev.name ?? "Error"}:`;
}

main().catch((e) => fail("harness_failed", `unexpected: ${e?.message ?? e}`));
