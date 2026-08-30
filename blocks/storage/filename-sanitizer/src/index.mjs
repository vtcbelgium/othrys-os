export function sanitizeFilename(filename) {
  if (typeof filename !== "string") {
    throw new TypeError("Input must be a string");
  }

  // NFC normalization
  filename = filename.normalize("NFC");

  // Remove ASCII control characters (0-31)
  filename = filename.replace(/[\x00-\x1f]/g, "");

  // Replace runs of <>:"/\\|?* with hyphen
  filename = filename.replace(/[<>:"/\\|?*]+/g, "-");

  // Collapse whitespace to one space
  filename = filename.replace(/\s+/g, " ");

  // Collapse hyphens
  filename = filename.replace(/-+/g, "-");

  // Trim
  filename = filename.trim();

  // Strip trailing dots and spaces
  filename = filename.replace(/[. ]+$/, "");

  // If result is empty OR consists only of hyphens then underscore
  if (filename === "" || /^-+$/.test(filename)) {
    filename = "_";
  }

  // Protect Windows reserved basenames
  const windowsReserved = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  if (windowsReserved.test(filename.split(".")[0])) {
    filename = "_" + filename;
  }

  // Max 255 UTF-16 code units without ending on a high surrogate
  if (filename.length > 255) {
    filename = filename.substring(0, 255);
  }

  // Ensure we don't end on a high surrogate
  if (filename.length > 0 && filename.charCodeAt(filename.length - 1) >= 0xD800 && filename.charCodeAt(filename.length - 1) <= 0xDBFF) {
    filename = filename.substring(0, filename.length - 1);
  }

  // Re-strip trailing dots and spaces
  filename = filename.replace(/[. ]+$/, "");

  // Fallback underscore if still empty
  if (filename === "") {
    filename = "_";
  }

  return filename;
}
