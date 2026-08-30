export function parseEnvMetadata(text) {
  if (typeof text !== 'string') throw new TypeError('text must be a string');
  const out = [], seen = new Set();
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (/^export\s+/.test(line)) line = line.replace(/^export\s+/, '');
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const name = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || seen.has(name)) continue;
    seen.add(name);
    const present = line.slice(eq + 1).trim().length > 0;
    out.push(Object.freeze({ name, present }));
  }
  return Object.freeze(out);
}
