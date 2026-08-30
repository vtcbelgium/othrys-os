import { createHash } from 'node:crypto';

export function checksum(input, algorithm = 'sha256', encoding = 'hex') {
  if (typeof input !== 'string' && !(input instanceof Uint8Array)) {
    throw new TypeError('Input must be a string or Uint8Array');
  }

  const validAlgorithms = ['sha256', 'sha512'];
  const validEncodings = ['hex', 'base64'];

  if (!validAlgorithms.includes(algorithm)) {
    throw new RangeError('Unsupported algorithm. Use "sha256" or "sha512".');
  }

  if (!validEncodings.includes(encoding)) {
    throw new RangeError('Unsupported encoding. Use "hex" or "base64".');
  }

  const hash = createHash(algorithm);

  if (typeof input === 'string') {
    hash.update(input, 'utf8');
  } else {
    hash.update(input);
  }

  return hash.digest(encoding);
}
