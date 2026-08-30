export function jsonValidate(input) {
  try {
    JSON.parse(input);
    return Object.freeze({ valid: true, error: null, position: null, line: null, column: null });
  } catch (e) {
    if (e instanceof SyntaxError) {
      let error = e.message;
      let position = null;
      let line = null;
      let column = null;

      if (error.includes('position')) {
        const match = error.match(/position (\d+)/);
        if (match) {
          position = parseInt(match[1], 10);
          const lineMatch = error.match(/line (\d+)/);
          const columnMatch = error.match(/column (\d+)/);
          line = lineMatch ? parseInt(lineMatch[1], 10) : null;
          column = columnMatch ? parseInt(columnMatch[1], 10) : null;
        }
      }

      return Object.freeze({
        valid: false,
        error: error,
        position: position,
        line: line,
        column: column
      });
    } else {
      throw e;
    }
  }
}
