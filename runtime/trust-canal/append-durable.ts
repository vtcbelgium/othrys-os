import { closeSync, constants, existsSync, fdatasyncSync, fsyncSync, mkdirSync, openSync, writeSync } from "node:fs";
import { dirname } from "node:path";

export function appendDurable(path: string, line: string): void {
  if (path.trim().length === 0) throw new TypeError("appendDurable: path must not be empty");
  const dir = dirname(path);
  if (dir && dir !== ".") mkdirSync(dir, { recursive: true, mode: 0o700 });
  const firstCreate = !existsSync(path);
  const payload = line.endsWith("\n") ? line : `${line}\n`;
  const fd = openSync(path, constants.O_WRONLY | constants.O_APPEND | constants.O_CREAT, 0o600);
  try {
    writeSync(fd, payload, undefined, "utf8");
    fdatasyncSync(fd);
  } finally {
    closeSync(fd);
  }
  if (firstCreate) {
    try {
      const dirFd = openSync(dir === "" || dir === "." ? "." : dir, constants.O_RDONLY);
      try { fsyncSync(dirFd); } finally { closeSync(dirFd); }
    } catch { /* Windows directory fsync unsupported; file fdatasync is the barrier. */ }
  }
}
