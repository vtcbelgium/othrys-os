export function normalizeText(s) {
  return s.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}
