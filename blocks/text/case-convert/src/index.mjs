export function convertCase(input, mode) {
  if (input === null || input === undefined) {
    return '';
  }
  const str = String(input);
  const modes = ['lower', 'upper', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab'];
  if (!modes.includes(mode)) {
    throw new RangeError(`Unsupported mode: ${mode}`);
  }

  switch (mode) {
    case 'lower':
      return str.toLowerCase();
    case 'upper':
      return str.toUpperCase();
    case 'title':
      return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([a-z0-9])_([a-z0-9])/g, '$1 $2')
        .replace(/([a-z0-9])-([a-z0-9])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .filter(token => token)
        .map(token => token.toLowerCase())
        .map(token => token.charAt(0).toUpperCase() + token.slice(1))
        .join(' ');
    case 'sentence':
      return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([a-z0-9])_([a-z0-9])/g, '$1 $2')
        .replace(/([a-z0-9])-([a-z0-9])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .filter(token => token)
        .map(token => token.toLowerCase())
        .map((token, index) => index === 0 ? token.charAt(0).toUpperCase() + token.slice(1) : token)
        .join(' ');
    case 'camel':
      return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([a-z0-9])_([a-z0-9])/g, '$1 $2')
        .replace(/([a-z0-9])-([a-z0-9])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .filter(token => token)
        .map(token => token.toLowerCase())
        .map((token, index) => index === 0 ? token : token.charAt(0).toUpperCase() + token.slice(1))
        .join('');
    case 'pascal':
      return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([a-z0-9])_([a-z0-9])/g, '$1 $2')
        .replace(/([a-z0-9])-([a-z0-9])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .filter(token => token)
        .map(token => token.toLowerCase())
        .map(token => token.charAt(0).toUpperCase() + token.slice(1))
        .join('');
    case 'snake':
      return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([a-z0-9])_([a-z0-9])/g, '$1 $2')
        .replace(/([a-z0-9])-([a-z0-9])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .filter(token => token)
        .map(token => token.toLowerCase())
        .join('_');
    case 'kebab':
      return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([a-z0-9])_([a-z0-9])/g, '$1 $2')
        .replace(/([a-z0-9])-([a-z0-9])/g, '$1 $2')
        .trim()
        .split(/\s+/)
        .filter(token => token)
        .map(token => token.toLowerCase())
        .join('-');
    default:
      throw new RangeError(`Unsupported mode: ${mode}`);
  }
}
