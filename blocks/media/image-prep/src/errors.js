/** Typed errors for block.media.image-prep. Hosts may map these to product UX. */

export const ERROR_CODES = Object.freeze({
  unsupported_type: "unsupported_type",
  decode_failed: "decode_failed",
  encode_failed: "encode_failed",
  canvas_unavailable: "canvas_unavailable",
});

export class ImagePrepError extends Error {
  /**
   * @param {keyof typeof ERROR_CODES | string} code
   * @param {string} message
   * @param {ErrorOptions} [options]
   */
  constructor(code, message, options) {
    super(message, options);
    this.name = "ImagePrepError";
    this.code = code;
  }
}
