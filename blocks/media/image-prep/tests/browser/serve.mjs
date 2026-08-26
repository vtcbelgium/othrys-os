import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const blockRoot = path.resolve(here, "..", "..");
const vtcRoot = path.resolve(blockRoot, "..", "..", "..", "..", "vtc-block-extract-001r");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

function resolveUrl(urlPath) {
  const clean = urlPath.split("?")[0];
  if (clean === "/" || clean === "/index.html") {
    return path.join(here, "harness", "index.html");
  }
  if (clean.startsWith("/src/")) {
    return path.join(blockRoot, clean.slice(1));
  }
  if (clean.startsWith("/tests/")) {
    return path.join(blockRoot, clean.slice(1));
  }
  if (clean === "/vtc/bgRemove.js") {
    return path.join(here, "harness", "bgRemove.js");
  }
  if (clean.startsWith("/vtc/")) {
    return path.join(vtcRoot, "src", clean.slice("/vtc/".length));
  }
  if (clean.startsWith("/harness/")) {
    return path.join(here, "harness", clean.slice("/harness/".length));
  }
  return path.join(here, "harness", clean.slice(1));
}

const server = http.createServer((req, res) => {
  const filePath = resolveUrl(req.url || "/");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end(`not found: ${req.url}\n${filePath}`);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(data);
  });
});

const port = Number(process.env.IMAGE_PREP_HARNESS_PORT || 4177);
server.listen(port, "127.0.0.1", () => {
  console.log(`image-prep harness http://127.0.0.1:${port}`);
});
