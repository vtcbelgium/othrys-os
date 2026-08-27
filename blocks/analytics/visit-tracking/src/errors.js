/** Typed errors for block.analytics.visit-tracking. Hosts and HTTP mounts may map these to response semantics. */

export const ERROR_CODES = Object.freeze({
  missing_salt: "missing_salt",
  invalid_salt: "invalid_salt",
  missing_storage_bridge: "missing_storage_bridge",
  invalid_request: "invalid_request",
  storage_error: "storage_error",
});

export class VisitTrackingError extends Error {
  /**
   * @param {keyof typeof ERROR_CODES | string} code
   * @param {string} message
   * @param {ErrorOptions} [options]
   */
  constructor(code, message, options) {
    super(message, options);
    this.name = "VisitTrackingError";
    this.code = code;
  }
}
