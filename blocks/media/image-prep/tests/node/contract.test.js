import { test } from "node:test";
import assert from "node:assert/strict";
import { prepareImage, ImagePrepError, ERROR_CODES, BLOCK_ID } from "../../src/index.js";

test("BLOCK_ID is the canonical logical identity", () => {
  assert.equal(BLOCK_ID, "block.media.image-prep");
});

test("Node without Canvas throws canvas_unavailable for a raster-typed blob", async () => {
  const png = new Blob([Uint8Array.from([137, 80, 78, 71])], { type: "image/png" });
  await assert.rejects(
    () => prepareImage(png, { operations: ["square"] }),
    (err) => {
      assert.ok(err instanceof ImagePrepError);
      assert.equal(err.code, ERROR_CODES.canvas_unavailable);
      return true;
    },
  );
});

test("SVG MIME is unsupported_type before any canvas work", async () => {
  const svg = new Blob(["<svg xmlns='http://www.w3.org/2000/svg'></svg>"], {
    type: "image/svg+xml",
  });
  await assert.rejects(
    () => prepareImage(svg, { operations: ["downscale"] }),
    (err) => {
      assert.ok(err instanceof ImagePrepError);
      assert.equal(err.code, ERROR_CODES.unsupported_type);
      return true;
    },
  );
});

test("missing source is decode_failed", async () => {
  await assert.rejects(
    () => prepareImage(null, { operations: ["square"] }),
    (err) => {
      assert.equal(err.code, ERROR_CODES.decode_failed);
      return true;
    },
  );
});

// V2-001C regression — defect A: parameterized SVG MIME bypassed the exact-string check.
// MIME essence (everything before the first ";", trimmed and lowercased) must decide.
for (const type of [
  "image/svg+xml",
  "image/svg+xml;charset=utf-8",
  "image/svg+xml; charset=utf-8",
  "IMAGE/SVG+XML; charset=UTF-8",
]) {
  test(`SVG MIME "${type}" is unsupported_type before any canvas work`, async () => {
    const svg = new Blob(["<svg xmlns='http://www.w3.org/2000/svg'></svg>"], { type });
    await assert.rejects(
      () => prepareImage(svg, { operations: ["normalize.jpeg"] }),
      (err) => {
        assert.ok(err instanceof ImagePrepError);
        assert.equal(err.code, ERROR_CODES.unsupported_type);
        return true;
      },
    );
  });
}

// V2-001C regression — defect A, negative control: a supported raster MIME carrying
// parameters must NOT be rejected as unsupported_type. In Node it reaches the canvas
// gate instead, which proves the MIME check let it through.
for (const type of ["image/png;charset=binary", "image/jpeg; foo=bar"]) {
  test(`supported raster MIME "${type}" survives the type gate`, async () => {
    const png = new Blob([Uint8Array.from([137, 80, 78, 71])], { type });
    await assert.rejects(
      () => prepareImage(png, { operations: ["downscale"] }),
      (err) => {
        assert.ok(err instanceof ImagePrepError);
        assert.equal(err.code, ERROR_CODES.canvas_unavailable);
        return true;
      },
    );
  });
}
