/**
 * Deduplicates lines from an array, preserving the first occurrence order.
 * @param {Array} lines - The array of lines to deduplicate.
 * @param {Object} [options={}] - Options for deduplication.
 * @param {boolean} [options.trim=false] - Whether to trim each line before comparison/output.
 * @param {boolean} [options.ignoreEmpty=false] - Whether to skip empty lines after optional trim.
 * @param {boolean} [options.caseSensitive=true] - Whether to compare lines case-sensitively.
 * @returns {Array} A new array of deduplicated lines.
 * @throws {TypeError} If input is not an array.
 */
export function dedupeLines(lines, options = {}) {
  if (!Array.isArray(lines)) {
    throw new TypeError('Input must be an array.');
  }

  const { trim = false, ignoreEmpty = false, caseSensitive = true } = options;
  const seen = new Set();
  const result = [];

  for (const line of lines) {
    let processedLine = String(line);

    if (trim) {
      processedLine = processedLine.trim();
    }

    if (ignoreEmpty && processedLine === '') {
      continue;
    }

    const key = caseSensitive ? processedLine : processedLine.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      result.push(processedLine);
    }
  }

  return result;
}
