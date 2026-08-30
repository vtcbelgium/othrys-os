export function textStats(input) {
  const text = input == null ? '' : String(input);
  const chars = Array.from(text).length;
  const words = text.trim() === '' ? 0 : text.split(/\s+/).length;
  const lines = text === '' ? 0 : text.replace(/[\r\n]+/g, '\n').split('\n').length;
  return Object.freeze({ chars, words, lines });
}
