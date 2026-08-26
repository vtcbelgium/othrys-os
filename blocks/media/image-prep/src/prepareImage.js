import { ImagePrepError, ERROR_CODES } from "./errors.js";
import { BLOCK_ID, CAPABILITY_DEFAULTS, PROFILES, OP } from "./config.js";

const ALIASES = {
  downscale: OP.downscale,
  "prepare.downscale": OP.downscale,
  "normalize.jpeg": OP.jpeg,
  "prepare.normalize.jpeg": OP.jpeg,
  jpeg: OP.jpeg,
  square: OP.square,
  "prepare.square": OP.square,
};

function canvasRuntimeAvailable() {
  return (
    typeof document !== "undefined" &&
    typeof Image !== "undefined" &&
    typeof FileReader !== "undefined" &&
    typeof document.createElement === "function"
  );
}

function normalizeOperations(raw, profile) {
  const fromOpts = Array.isArray(raw) ? raw : null;
  const fromProfile = profile?.operations;
  const list = fromOpts && fromOpts.length ? fromOpts : fromProfile || [OP.jpeg];
  const out = [];
  for (const item of list) {
    const mapped = ALIASES[item];
    if (!mapped) {
      throw new ImagePrepError(
        ERROR_CODES.unsupported_type,
        `Unknown operation: ${String(item)}`,
      );
    }
    if (!out.includes(mapped)) out.push(mapped);
  }
  return out;
}

function mergeConfig(profile, config) {
  return {
    ...CAPABILITY_DEFAULTS,
    ...(profile || {}),
    ...(config || {}),
  };
}

function decodeSource(source) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new ImagePrepError(ERROR_CODES.decode_failed, "Image decode failed"));
      img.src = ev.target.result;
    };
    reader.onerror = () =>
      reject(new ImagePrepError(ERROR_CODES.decode_failed, "FileReader failed"));
    try {
      reader.readAsDataURL(source);
    } catch (err) {
      reject(
        new ImagePrepError(ERROR_CODES.decode_failed, "FileReader rejected the source", {
          cause: err,
        }),
      );
    }
  });
}

/**
 * Opaque bounding-box trim. Origin: alpha channel > threshold counts as subject.
 * On getImageData failure, degrade — caller uses the full frame (bboxTrimmed=false).
 */
function measureOpaqueBbox(img, alphaThreshold) {
  const tmp = document.createElement("canvas");
  tmp.width = img.width;
  tmp.height = img.height;
  const tctx = tmp.getContext("2d");
  if (!tctx) throw new Error("2d context missing");
  tctx.drawImage(img, 0, 0);
  const d = tctx.getImageData(0, 0, img.width, img.height).data;
  let minX = img.width;
  let minY = img.height;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (d[(y * img.width + x) * 4 + 3] > alphaThreshold) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (found && maxX > minX && maxY > minY) {
    return { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 };
  }
  return null;
}

function canvasToJpeg(canvas, jpegQuality) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== "function") {
      reject(
        new ImagePrepError(ERROR_CODES.canvas_unavailable, "canvas.toBlob is not available"),
      );
      return;
    }
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new ImagePrepError(ERROR_CODES.encode_failed, "canvas.toBlob returned null"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      jpegQuality,
    );
  });
}

function require2d(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new ImagePrepError(ERROR_CODES.canvas_unavailable, "2D canvas context unavailable");
  }
  return ctx;
}

/**
 * prepare.square — origin toWhiteSquare compose (without background-removal).
 * Output always size×size JPEG. Subject contain-fit inside subjectFill box, centered.
 * Small images are scaled up (origin does this). fill covers the rest.
 */
function composeSquare(img, sx, sy, sw, sh, cfg) {
  const SIZE = cfg.size;
  const M = cfg.subjectFill;
  const scale = Math.min((SIZE * M) / sw, (SIZE * M) / sh);
  const w = sw * scale;
  const h = sh * scale;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = require2d(canvas);
  ctx.fillStyle = cfg.fill;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(img, sx, sy, sw, sh, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
  return { canvas, width: SIZE, height: SIZE };
}

/**
 * prepare.downscale — long-edge cap. Origin compressImage uses Math.min(..., 1) (no upscale).
 * Optional fill: if cfg.fill is a non-empty string, paint it first (catalog-quick / compressImage).
 * Origin ScanFlow.handleFile and uploadUserImage do not fill — pass fill: null.
 */
function composeDownscale(img, cfg) {
  const maxPx = cfg.longEdge;
  const upscale = cfg.upscale === true;
  let scale = Math.min(maxPx / img.width, maxPx / img.height);
  if (!upscale) scale = Math.min(scale, 1);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = require2d(canvas);
  if (typeof cfg.fill === "string" && cfg.fill.length) {
    ctx.fillStyle = cfg.fill;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

/** prepare.normalize.jpeg — same pixel dimensions, JPEG re-encode (EXIF stripped as a side effect). */
function composeNormalize(img, cfg) {
  const width = img.width;
  const height = img.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = require2d(canvas);
  if (typeof cfg.fill === "string" && cfg.fill.length) {
    ctx.fillStyle = cfg.fill;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0);
  return { canvas, width, height };
}

/**
 * Prepare a raster Blob/File.
 *
 * @param {Blob|File} source
 * @param {{
 *   operations?: string[],
 *   profile?: string,
 *   config?: Record<string, unknown>,
 * }} [options]
 * @returns {Promise<{
 *   blob: Blob,
 *   width: number,
 *   height: number,
 *   format: string,
 *   bboxTrimmed: boolean,
 *   backgroundRemoved: boolean,
 *   durationMs: number,
 *   operationsApplied: string[],
 *   blockId: string,
 * }>}
 */
export async function prepareImage(source, options = {}) {
  const started = Date.now();
  if (source == null) {
    throw new ImagePrepError(ERROR_CODES.decode_failed, "Missing image source");
  }
  const mime = source.type || "";
  // MIME essence per WHATWG: everything before the first ";", trimmed, lowercased.
  // Parameters such as ";charset=utf-8" must not defeat the rejection.
  const mimeEssence = mime.split(";", 1)[0].trim().toLowerCase();
  if (mimeEssence === "image/svg+xml") {
    throw new ImagePrepError(ERROR_CODES.unsupported_type, "SVG is not a supported raster");
  }

  if (!canvasRuntimeAvailable()) {
    throw new ImagePrepError(
      ERROR_CODES.canvas_unavailable,
      "Browser Canvas/Image/FileReader runtime is required",
    );
  }

  const profile = options.profile ? PROFILES[options.profile] : null;
  if (options.profile && !profile) {
    throw new ImagePrepError(
      ERROR_CODES.unsupported_type,
      `Unknown profile: ${options.profile}`,
    );
  }

  const operations = normalizeOperations(options.operations, profile);
  const cfg = mergeConfig(profile, options.config);

  const img = await decodeSource(source);

  const applied = [];
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  let bboxTrimmed = false;

  const wantsSquare = operations.includes(OP.square);
  const wantsDownscale = operations.includes(OP.downscale);
  const wantsJpeg = operations.includes(OP.jpeg) || wantsSquare || wantsDownscale;

  if (wantsDownscale && !wantsSquare) {
    const drawn = composeDownscale(img, cfg);
    applied.push(OP.downscale);
    if (wantsJpeg) applied.push(OP.jpeg);
    const blob = await canvasToJpeg(drawn.canvas, cfg.jpegQuality);
    return {
      blob,
      width: drawn.width,
      height: drawn.height,
      format: "image/jpeg",
      bboxTrimmed: false,
      backgroundRemoved: false,
      durationMs: Date.now() - started,
      operationsApplied: applied,
      blockId: BLOCK_ID,
    };
  }

  if (wantsSquare) {
    try {
      const box = measureOpaqueBbox(img, cfg.alphaThreshold);
      if (box) {
        sx = box.sx;
        sy = box.sy;
        sw = box.sw;
        sh = box.sh;
        bboxTrimmed =
          box.sx > 0 || box.sy > 0 || box.sw < img.width || box.sh < img.height;
      }
    } catch (cropErr) {
      console.warn("bbox trim skipped:", cropErr);
    }
    const drawn = composeSquare(img, sx, sy, sw, sh, cfg);
    applied.push(OP.square);
    if (wantsJpeg || true) applied.push(OP.jpeg);
    const blob = await canvasToJpeg(drawn.canvas, cfg.jpegQuality);
    return {
      blob,
      width: drawn.width,
      height: drawn.height,
      format: "image/jpeg",
      bboxTrimmed,
      backgroundRemoved: false,
      durationMs: Date.now() - started,
      operationsApplied: [...new Set(applied)],
      blockId: BLOCK_ID,
    };
  }

  const drawn = composeNormalize(img, cfg);
  applied.push(OP.jpeg);
  const blob = await canvasToJpeg(drawn.canvas, cfg.jpegQuality);
  return {
    blob,
    width: drawn.width,
    height: drawn.height,
    format: "image/jpeg",
    bboxTrimmed: false,
    backgroundRemoved: false,
    durationMs: Date.now() - started,
    operationsApplied: applied,
    blockId: BLOCK_ID,
  };
}
