function parseColor(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }

  const trimmed = input.trim();
  let hexMatch;
  let rgbMatch;

  // Try hex first: #RGB or #RRGGBB
  hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed);
  if (hexMatch) {
    const hex = hexMatch[1].toLowerCase();
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    return Object.freeze({ hex: '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0'), r, g, b });
  }

  // Try rgb: rgb(r,g,b) or rgb( r , g , b ) with optional spaces
  rgbMatch = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(trimmed);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new RangeError('Channel values must be between 0 and 255');
    }

    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toLowerCase();
    return Object.freeze({ hex, r, g, b });
  }

  throw new RangeError('Invalid color format');
}

export { parseColor };
