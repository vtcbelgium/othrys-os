export function classifyFile(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Input must be a non-empty string');
  }

  // Find the last separator to determine basename
  const lastSeparatorIndex = Math.max(
    name.lastIndexOf('/'),
    name.lastIndexOf('\\')
  );

  const basename = lastSeparatorIndex === -1
    ? name
    : name.substring(lastSeparatorIndex + 1);

  // Handle special case: if basename starts with . and contains no other dot, extension is empty
  let extension = '';
  if (basename.startsWith('.')) {
    if (!basename.slice(1).includes('.')) {
      extension = '';
    } else {
      const lastDotIndex = basename.lastIndexOf('.');
      if (lastDotIndex > 0) {
        extension = basename.substring(lastDotIndex + 1).toLowerCase();
      }
    }
  } else {
    // Normal case: extension is substring after the last dot
    const lastDotIndex = basename.lastIndexOf('.');
    if (lastDotIndex > 0) {
      extension = basename.substring(lastDotIndex + 1).toLowerCase();
    }
  }

  const categories = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
    video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
    document: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'],
    data: ['csv', 'json', 'xml', 'yaml', 'yml'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    code: ['js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'py', 'java', 'c', 'cpp', 'h', 'css', 'html', 'htm', 'sh', 'ps1']
  };

  for (const [cat, exts] of Object.entries(categories)) {
    if (exts.includes(extension)) {
      return Object.freeze({ extension, category: cat });
    }
  }

  return Object.freeze({ extension, category: 'other' });
}
