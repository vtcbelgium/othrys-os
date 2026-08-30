/**
 * Normalizes a portable path according to the specified contract.
 * @param {string} input - The input path to normalize.
 * @returns {string} - The normalized path.
 * @throws {TypeError} - If input is empty or not a string.
 */
export function normalizePortablePath(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }

  if (input === '') {
    throw new TypeError('Input cannot be empty');
  }

  // Handle root detection and preservation
  let isAbsolute = false;
  let root = '';
  let path = input;

  // Check for Windows-style root (C:\)
  if (/^[a-zA-Z]:[\\/]/.test(input)) {
    isAbsolute = true;
    root = input[0].toLowerCase() + ':/';
    path = input.substring(3);
  }
  // Check for UNC root (\\server\share)
  else if (/^\\\\[^\\]+\\[^\\]+/.test(input)) {
    isAbsolute = true;
    const match = input.match(/^\\\\[^\\]+\\[^\\]+/);
    const rawRoot = match[0];
    root = '//' + rawRoot.slice(2).replace(/\\/g, '/');
    path = input.substring(rawRoot.length);
  }
  // Check for Unix-style root (/)
  else if (input.startsWith('/')) {
    isAbsolute = true;
    root = '/';
    path = input.substring(1);
  }

  // Split path into components
  let components = path.split(/[\\/]+/).filter(c => c !== '' && c !== '.');

  // Process components to resolve .. and .
  const normalizedComponents = [];
  for (let i = 0; i < components.length; i++) {
    if (components[i] === '..') {
      if (normalizedComponents.length > 0 && normalizedComponents[normalizedComponents.length - 1] !== '..') {
        normalizedComponents.pop();
      } else if (!isAbsolute) {
        normalizedComponents.push('..');
      }
    } else {
      normalizedComponents.push(components[i]);
    }
  }

  // Reconstruct path
  let result = normalizedComponents.join('/');

  // Add root back
  if (root !== '') {
    result = root + result;
  }

  // Special case: if result is empty and was absolute, return root
  if (result === '' && isAbsolute) {
    return root;
  }

  // Special case: if result is empty and was not absolute, return '.'
  if (result === '') {
    return '.';
  }

  return result;
}
