import { test, expect } from "@playwright/test";

/**
 * Real Chromium Canvas/Image/toBlob/getImageData tests.
 * Fixture provenance: generated in-page with Canvas fillRect. No remote URLs,
 * no third-party photographs, no copyrighted images.
 *
 * Case IDs match Hub docs/VTC-BLOCK-CONTRACT-001/ACCEPTANCE-PLAN.md.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.__imagePrepReady === true);
});

const CATALOG_TILE = {
  size: 800,
  subjectFill: 0.86,
  fill: "#ffffff",
  jpegQuality: 0.88,
  alphaThreshold: 20,
};

test("harness exposes canonical Block identity", async ({ page }) => {
  const id = await page.evaluate(() => window.BLOCK_ID);
  expect(id).toBe("block.media.image-prep");
});

test("S1 landscape: 800² JPEG, white corners, red subject preserved", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 800;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#cc0000";
    ctx.fillRect(0, 0, 1200, 800);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    const out = await prepareImage(src, { operations: ["square"], config: cfg });
    return inspect(out);
  }, CATALOG_TILE);
  expectSquareJpeg(result);
  expect(result.corners.every(whiteish)).toBe(true);
  expect(result.center[0]).toBeGreaterThan(180);
  expect(result.bboxTrimmed).toBe(false);
});

test("S2 portrait: 800² JPEG, white corners", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 1200;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0066cc";
    ctx.fillRect(0, 0, 800, 1200);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
  }, CATALOG_TILE);
  expectSquareJpeg(result);
  expect(result.corners.every(whiteish)).toBe(true);
  expect(result.center[2]).toBeGreaterThan(180);
});

test("S3 already-square: still 86% inset, not edge-to-edge", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 1000;
    c.height = 1000;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#00aa44";
    ctx.fillRect(0, 0, 1000, 1000);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
  }, CATALOG_TILE);
  expectSquareJpeg(result);
  expect(result.corners.every(whiteish)).toBe(true);
  expect(result.center[1]).toBeGreaterThan(120);
});

test("S4 transparent PNG: bbox trim enlarges the subject vs untrimmed", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 400;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillStyle = "#ff00aa";
    ctx.fillRect(150, 150, 100, 100);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    const trimmed = await prepareImage(src, { operations: ["square"], config: cfg });
    const untrimmed = await prepareImage(src, {
      operations: ["square"],
      config: { ...cfg, alphaThreshold: 255 },
    });
    const a = await inspect(trimmed);
    const b = await inspect(untrimmed);
    return { a, b };
  }, CATALOG_TILE);
  expect(result.a.bboxTrimmed).toBe(true);
  expectSquareJpeg(result.a);
  expect(result.a.corners.every(whiteish)).toBe(true);
  expect(result.a.center[0]).toBeGreaterThan(200);
  const trimmedCoverage = result.a.nonWhiteCount;
  const untrimmedCoverage = result.b.nonWhiteCount;
  expect(trimmedCoverage).toBeGreaterThan(untrimmedCoverage);
});

test("S5 very small: 10×6 upscales into 800² without throw", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 10;
    c.height = 6;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#2222aa";
    ctx.fillRect(0, 0, 10, 6);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
  }, CATALOG_TILE);
  expectSquareJpeg(result);
});

test("S6 large 2000×1500: completes at 800²", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 2000;
    c.height = 1500;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#885500";
    ctx.fillRect(0, 0, 2000, 1500);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
  }, CATALOG_TILE);
  expectSquareJpeg(result);
});

test("S7 garbage bytes: typed decode_failed, does not throw untyped", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const src = new Blob(["not-an-image"], { type: "text/plain" });
    try {
      await prepareImage(src, { operations: ["square"] });
      return { ok: true };
    } catch (err) {
      return { ok: false, name: err.name, code: err.code };
    }
  });
  expect(result.ok).toBe(false);
  expect(result.code).toBe("decode_failed");
  expect(result.name).toBe("ImagePrepError");
});

test("S8 truncated JPEG: decode_failed", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const src = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], { type: "image/jpeg" });
    try {
      await prepareImage(src, { operations: ["square"] });
      return { ok: true };
    } catch (err) {
      return { ok: false, code: err.code };
    }
  });
  expect(result.ok).toBe(false);
  expect(result.code).toBe("decode_failed");
});

test("S9 S12 output dimensions and JPEG format", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 240;
    c.getContext("2d").fillRect(0, 0, 320, 240);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    const out = await prepareImage(src, { operations: ["square"], config: cfg });
    return inspect(out);
  }, CATALOG_TILE);
  expect(result.width).toBe(800);
  expect(result.height).toBe(800);
  expect(result.jpegMagic).toBe(true);
  expect(result.format).toBe("image/jpeg");
});

test("S10 padding: four corners are white", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 400;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, 1200, 400);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
  }, CATALOG_TILE);
  expect(result.corners.every(whiteish)).toBe(true);
});

test("S11 content preservation: red rectangle remains in center band", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 400;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(50, 50, 300, 300);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
  }, CATALOG_TILE);
  expect(result.center[0]).toBeGreaterThan(200);
  expect(result.center[1]).toBeLessThan(80);
  expect(result.nonWhiteCount).toBeGreaterThan(1000);
});

test("S13 same Chromium: dimensions and corners stable across two runs", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const make = async () => {
      const c = document.createElement("canvas");
      c.width = 640;
      c.height = 480;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#336699";
      ctx.fillRect(0, 0, 640, 480);
      return new Promise((r) => c.toBlob(r, "image/png"));
    };
    const src = await make();
    const a = await inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
    const b = await inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
    return { a, b };
  }, CATALOG_TILE);
  expect(result.a.width).toBe(result.b.width);
  expect(result.a.height).toBe(result.b.height);
  expect(result.a.corners).toEqual(result.b.corners);
});

test("S14 backgroundRemoved is always false on the core path", async ({ page }) => {
  const flag = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 80;
    c.height = 80;
    c.getContext("2d").fillRect(0, 0, 80, 80);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    const out = await prepareImage(src, { operations: ["square"], config: cfg });
    return out.backgroundRemoved;
  }, CATALOG_TILE);
  expect(flag).toBe(false);
});

test("D1 oversize downscale: long edge ≤ 1200, aspect preserved", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 4000;
    c.height = 2000;
    c.getContext("2d").fillRect(0, 0, 4000, 2000);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(
      await prepareImage(src, {
        operations: ["downscale"],
        config: { longEdge: 1200, jpegQuality: 0.88, upscale: false, fill: "#ffffff" },
      }),
    );
  });
  expect(result.width).toBe(1200);
  expect(result.height).toBe(600);
  expect(result.jpegMagic).toBe(true);
  expect(result.operationsApplied).toContain("prepare.downscale");
});

test("D2 already small: no upscale", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 300;
    c.getContext("2d").fillRect(0, 0, 400, 300);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(
      await prepareImage(src, {
        operations: ["downscale"],
        config: { longEdge: 1200, jpegQuality: 0.88, upscale: false },
      }),
    );
  });
  expect(result.width).toBe(400);
  expect(result.height).toBe(300);
});

test("D3 SVG MIME: unsupported_type", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const src = new Blob(["<svg xmlns='http://www.w3.org/2000/svg'></svg>"], {
      type: "image/svg+xml",
    });
    try {
      await prepareImage(src, { operations: ["downscale"] });
      return { ok: true };
    } catch (err) {
      return { ok: false, code: err.code };
    }
  });
  expect(result.ok).toBe(false);
  expect(result.code).toBe("unsupported_type");
});

test("normalize.jpeg keeps original dimensions", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 123;
    c.height = 77;
    c.getContext("2d").fillRect(0, 0, 123, 77);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    return inspect(await prepareImage(src, { operations: ["normalize.jpeg"], config: { jpegQuality: 0.85 } }));
  });
  expect(result.width).toBe(123);
  expect(result.height).toBe(77);
  expect(result.jpegMagic).toBe(true);
});

test("pre/post vs frozen origin oracle: contract-equivalent on landscape", async ({ page }) => {
  const result = await page.evaluate(async (cfg) => {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 800;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#cc0000";
    ctx.fillRect(0, 0, 1200, 800);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    const block = await inspect(await prepareImage(src, { operations: ["square"], config: cfg }));
    const oracleBlob = await originOracleToWhiteSquare(src);
    const oracle = await inspect({ blob: oracleBlob, width: 800, height: 800, format: oracleBlob.type, bboxTrimmed: null, backgroundRemoved: false, operationsApplied: ["origin-oracle"] });
    return { block, oracle };
  }, CATALOG_TILE);
  expect(result.block.width).toBe(result.oracle.width);
  expect(result.block.height).toBe(result.oracle.height);
  expect(result.block.jpegMagic).toBe(true);
  expect(result.oracle.jpegMagic).toBe(true);
  expect(result.block.corners.every(whiteish)).toBe(true);
  expect(result.oracle.corners.every(whiteish)).toBe(true);
  const sizeRatio = result.block.size / result.oracle.size;
  expect(sizeRatio).toBeGreaterThan(0.5);
  expect(sizeRatio).toBeLessThan(2);
  const centerDelta =
    Math.abs(result.block.center[0] - result.oracle.center[0]) +
    Math.abs(result.block.center[1] - result.oracle.center[1]) +
    Math.abs(result.block.center[2] - result.oracle.center[2]);
  expect(centerDelta).toBeLessThan(40);
});

test("VTC toWhiteSquare adapter consumes the canonical Block (bg-remove stubbed)", async ({ page }) => {
  const result = await page.evaluate(async () => {
    if (!window.vtcAdapterLoaded || typeof toWhiteSquare !== "function") {
      return { loaded: false, error: window.vtcAdapterError || "missing" };
    }
    const c = document.createElement("canvas");
    c.width = 500;
    c.height = 300;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#aa5500";
    ctx.fillRect(0, 0, 500, 300);
    const src = await new Promise((r) => c.toBlob(r, "image/png"));
    const wb = await toWhiteSquare(src);
    if (!wb) return { loaded: true, blob: false };
    const info = await inspect({
      blob: wb,
      width: 800,
      height: 800,
      format: wb.type,
      bboxTrimmed: null,
      backgroundRemoved: false,
      operationsApplied: [],
    });
    const srcText = await fetch("/vtc/whiteSquare.js").then((r) => r.text());
    return {
      loaded: true,
      blob: true,
      info,
      blockId: BLOCK_ID,
      adapterImportsBlock: srcText.includes("@othrys-blocks/media-image-prep"),
      adapterHasComposeLoop: /SIZE\s*=\s*800/.test(srcText) && srcText.includes("getImageData"),
    };
  });
  expect(result.loaded).toBe(true);
  expect(result.blob).toBe(true);
  expectSquareJpeg(result.info);
  expect(result.adapterImportsBlock).toBe(true);
  expect(result.adapterHasComposeLoop).toBe(false);
});

// V2-001C regression - defect B: an extreme aspect downscale rounded the short edge to 0,
// which produced a zero-sized canvas and surfaced encode_failed. Every output raster
// dimension must stay at least one pixel, on both axes.
for (const [label, w, h, expected] of [
  ["4096x1", 4096, 1, { width: 1200, height: 1 }],
  ["1x4096", 1, 4096, { width: 1, height: 1200 }],
  ["1x1", 1, 1, { width: 1, height: 1 }],
  ["exact longEdge 1200x800", 1200, 800, { width: 1200, height: 800 }],
  ["just over longEdge 1201x800", 1201, 800, { width: 1200, height: 799 }],
]) {
  test(`downscale ${label} keeps every dimension >= 1 px`, async ({ page }) => {
    const result = await page.evaluate(async ([sw, sh]) => {
      const c = document.createElement("canvas");
      c.width = sw;
      c.height = sh;
      c.getContext("2d").fillRect(0, 0, sw, sh);
      const src = await new Promise((r) => c.toBlob(r, "image/png"));
      try {
        const out = await prepareImage(src, {
          operations: ["downscale"],
          config: { longEdge: 1200, upscale: false },
        });
        return { ok: true, width: out.width, height: out.height, jpegMagic: (await out.blob.slice(0, 2).arrayBuffer()) && true };
      } catch (error) {
        return { ok: false, name: error.name, code: error.code };
      }
    }, [w, h]);
    expect(result.ok).toBe(true);
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.height).toBeGreaterThanOrEqual(1);
    expect({ width: result.width, height: result.height }).toEqual(expected);
  });
}

// V2-001C regression - defect A in the real browser runtime: parameterized SVG MIME
// must reject as unsupported_type, and a parameterized raster MIME must not.
for (const type of ["image/svg+xml", "image/svg+xml;charset=utf-8", "image/svg+xml; charset=utf-8"]) {
  test(`SVG MIME "${type}" rejects as unsupported_type in Chromium`, async ({ page }) => {
    const result = await page.evaluate(async (mime) => {
      const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='4' height='4'/></svg>";
      try {
        await prepareImage(new Blob([svg], { type: mime }), { operations: ["normalize.jpeg"] });
        return { ok: true };
      } catch (error) {
        return { ok: false, name: error.name, code: error.code };
      }
    }, type);
    expect(result).toEqual({ ok: false, name: "ImagePrepError", code: "unsupported_type" });
  });
}

test("parameterized raster MIME is still normalized in Chromium", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 40;
    c.height = 30;
    c.getContext("2d").fillRect(0, 0, 40, 30);
    const png = await new Promise((r) => c.toBlob(r, "image/png"));
    const src = new Blob([await png.arrayBuffer()], { type: "image/png;charset=binary" });
    return inspect(await prepareImage(src, { operations: ["normalize.jpeg"] }));
  });
  expect(result).toMatchObject({ width: 40, height: 30, jpegMagic: true });
});

function whiteish(rgb) {
  return rgb[0] >= 250 && rgb[1] >= 250 && rgb[2] >= 250;
}

function expectSquareJpeg(result) {
  expect(result.width).toBe(800);
  expect(result.height).toBe(800);
  expect(result.jpegMagic).toBe(true);
}
