export function jsonFormat(input, mode = "pretty") {
  if (mode !== "pretty" && mode !== "minify") {
    throw new RangeError("Unsupported mode");
  }
  try {
    const value = JSON.parse(input);
    if (mode === "pretty") {
      return JSON.stringify(value, null, 2) + "\n";
    } else if (mode === "minify") {
      return JSON.stringify(value);
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw error;
    }
    throw new Error("Invalid JSON");
  }
}
