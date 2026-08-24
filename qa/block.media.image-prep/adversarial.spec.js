import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => window.__imagePrepReady === true);
});

test("default operation normalizes to JPEG without changing dimensions", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 37;
    canvas.height = 19;
    canvas.getContext("2d").fillRect(0, 0, 37, 19);
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return inspect(await prepareImage(source));
  });
  expect(result).toMatchObject({ width: 37, height: 19, format: "image/jpeg", jpegMagic: true, blockId: "block.media.image-prep", operationsApplied: ["prepare.normalize.jpeg"] });
});

test("operation aliases deduplicate to canonical metadata", async ({ page }) => {
  const operations = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 20;
    canvas.getContext("2d").fillRect(0, 0, 40, 20);
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const out = await prepareImage(source, { operations: ["jpeg", "normalize.jpeg", "prepare.normalize.jpeg"] });
    return out.operationsApplied;
  });
  expect(operations).toEqual(["prepare.normalize.jpeg"]);
});

test("unknown operation fails with typed unsupported_type", async ({ page }) => {
  const result = await page.evaluate(async () => {
    try {
      await prepareImage(new Blob(["anything"], { type: "image/png" }), { operations: ["invented.operation"] });
      return { ok: true };
    } catch (error) {
      return { ok: false, name: error.name, code: error.code };
    }
  });
  expect(result).toEqual({ ok: false, name: "ImagePrepError", code: "unsupported_type" });
});

test("unknown profile fails with typed unsupported_type", async ({ page }) => {
  const result = await page.evaluate(async () => {
    try {
      await prepareImage(new Blob(["anything"], { type: "image/png" }), { profile: "not-a-profile" });
      return { ok: true };
    } catch (error) {
      return { ok: false, name: error.name, code: error.code };
    }
  });
  expect(result).toEqual({ ok: false, name: "ImagePrepError", code: "unsupported_type" });
});

for (const fixture of [
  { name: "empty data", bytes: [], type: "image/png" },
  { name: "corrupt PNG", bytes: [0x89, 0x50, 0x4e, 0x47, 0x00, 0xff], type: "image/png" },
  { name: "truncated JPEG", bytes: [0xff, 0xd8, 0xff, 0xe0, 0x00], type: "image/jpeg" },
]) {
  test(`${fixture.name} fails with typed decode_failed`, async ({ page }) => {
    const result = await page.evaluate(async ({ bytes, type }) => {
      try {
        await prepareImage(new Blob([new Uint8Array(bytes)], { type }), { operations: ["square"] });
        return { ok: true };
      } catch (error) {
        return { ok: false, name: error.name, code: error.code };
      }
    }, fixture);
    expect(result).toEqual({ ok: false, name: "ImagePrepError", code: "decode_failed" });
  });
}

// Defect proof: intentionally fails on admitted 0.1.0 until its exact-MIME check is repaired.
test("SVG MIME with parameters is rejected as unsupported_type", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='4' height='4'/></svg>";
    try {
      await prepareImage(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), { operations: ["normalize.jpeg"] });
      return { ok: true };
    } catch (error) {
      return { ok: false, name: error.name, code: error.code };
    }
  });
  expect(result).toEqual({ ok: false, name: "ImagePrepError", code: "unsupported_type" });
});

test("fully transparent PNG squares to opaque fill without a false trim", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 24;
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return inspect(await prepareImage(source, { operations: ["square"], config: { size: 64, fill: "#ffffff" } }));
  });
  expect(result.width).toBe(64);
  expect(result.height).toBe(64);
  expect(result.bboxTrimmed).toBe(false);
  expect(result.corners.every(([r, g, b]) => r >= 250 && g >= 250 && b >= 250)).toBe(true);
});

test("alpha threshold boundary is strict: 20 ignored and 21 included", async ({ page }) => {
  const result = await page.evaluate(async () => {
    async function run(alpha) {
      const canvas = document.createElement("canvas");
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = `rgba(255,0,0,${alpha / 255})`;
      ctx.fillRect(8, 8, 4, 4);
      const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      return prepareImage(source, { operations: ["square"], config: { size: 40, alphaThreshold: 20 } });
    }
    return { at: (await run(20)).bboxTrimmed, above: (await run(21)).bboxTrimmed };
  });
  expect(result).toEqual({ at: false, above: true });
});

test("downscale exact and just-over boundaries preserve aspect within rounding", async ({ page }) => {
  const result = await page.evaluate(async () => {
    async function run(width, height) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").fillRect(0, 0, width, height);
      const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const out = await prepareImage(source, { operations: ["downscale"], config: { longEdge: 1200, upscale: false } });
      return { width: out.width, height: out.height };
    }
    return { exact: await run(1200, 800), over: await run(1201, 800) };
  });
  expect(result.exact).toEqual({ width: 1200, height: 800 });
  expect(result.over).toEqual({ width: 1200, height: 799 });
});

// Defect proof: intentionally fails on admitted 0.1.0 because Math.round produces height 0.
test("extreme valid aspect ratio retains at least one pixel on the short edge", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 4096;
    canvas.height = 1;
    canvas.getContext("2d").fillRect(0, 0, 4096, 1);
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    try {
      const out = await prepareImage(source, { operations: ["downscale"], config: { longEdge: 1200, upscale: false } });
      return { ok: true, width: out.width, height: out.height };
    } catch (error) {
      return { ok: false, name: error.name, code: error.code };
    }
  });
  expect(result).toEqual({ ok: true, width: 1200, height: 1 });
});

test("1x1 source safely squares to configured dimensions", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.getContext("2d").fillRect(0, 0, 1, 1);
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return inspect(await prepareImage(source, { operations: ["square"], config: { size: 32 } }));
  });
  expect(result).toMatchObject({ width: 32, height: 32, jpegMagic: true });
});

test("large 5000x3000 image downscales without exceeding long edge", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 5000;
    canvas.height = 3000;
    canvas.getContext("2d").fillRect(0, 0, 5000, 3000);
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return inspect(await prepareImage(source, { operations: ["downscale"], config: { longEdge: 1200, upscale: false } }));
  });
  expect(result).toMatchObject({ width: 1200, height: 720, jpegMagic: true });
});

test("JPEG normalization is dimension-idempotent across a second normalization", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 93;
    canvas.height = 61;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#2468ac";
    ctx.fillRect(0, 0, 93, 61);
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const once = await prepareImage(source, { operations: ["normalize.jpeg"] });
    const twice = await prepareImage(once.blob, { operations: ["normalize.jpeg"] });
    return { once: await inspect(once), twice: await inspect(twice) };
  });
  expect(result.once.width).toBe(result.twice.width);
  expect(result.once.height).toBe(result.twice.height);
  expect(result.once.center).toEqual(result.twice.center);
  expect(result.once.jpegMagic).toBe(true);
  expect(result.twice.jpegMagic).toBe(true);
});

test("ten repeated runs are semantically deterministic without asserting JPEG bytes", async ({ page }) => {
  const results = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 127;
    canvas.height = 83;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#3579bd";
    ctx.fillRect(0, 0, 127, 83);
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const runs = [];
    for (let index = 0; index < 10; index += 1) {
      const inspected = await inspect(await prepareImage(source, { operations: ["square"], config: { size: 96 } }));
      runs.push({ width: inspected.width, height: inspected.height, center: inspected.center, corners: inspected.corners, operationsApplied: inspected.operationsApplied });
    }
    return runs;
  });
  expect(results.every((result) => JSON.stringify(result) === JSON.stringify(results[0]))).toBe(true);
});

test("eight concurrent transforms stay isolated", async ({ page }) => {
  const results = await page.evaluate(async () => {
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#884400", "#448800"];
    return Promise.all(colors.map(async (color, index) => {
      const canvas = document.createElement("canvas");
      canvas.width = 60 + index;
      canvas.height = 40 + index;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      return inspect(await prepareImage(source, { operations: ["square"], config: { size: 64, subjectFill: 0.8 } }));
    }));
  });
  expect(results).toHaveLength(8);
  expect(results.every((result) => result.width === 64 && result.height === 64)).toBe(true);
  expect(new Set(results.map((result) => result.center.slice(0, 3).join(","))).size).toBe(8);
});

test("prepareImage does not mutate source Blob or caller options", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 31;
    canvas.getContext("2d").fillRect(0, 0, 48, 31);
    const source = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const options = { operations: ["downscale"], config: { longEdge: 24, upscale: false, fill: null } };
    const beforeBytes = Array.from(new Uint8Array(await source.arrayBuffer()));
    const beforeOptions = JSON.stringify(options);
    await prepareImage(source, options);
    const afterBytes = Array.from(new Uint8Array(await source.arrayBuffer()));
    return {
      sameBytes: beforeBytes.length === afterBytes.length && beforeBytes.every((value, index) => value === afterBytes[index]),
      sameType: source.type === "image/png",
      sameOptions: JSON.stringify(options) === beforeOptions,
    };
  });
  expect(result).toEqual({ sameBytes: true, sameType: true, sameOptions: true });
});
