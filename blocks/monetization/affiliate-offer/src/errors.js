/** Typed errors for block.monetization.affiliate-offer. Hosts may map these to product UX. */

export const ERROR_CODES = Object.freeze({
  missing_attribution_config: "missing_attribution_config",
  unknown_provider: "unknown_provider",
  unsafe_url: "unsafe_url",
  invalid_request: "invalid_request",
  invalid_provider_config: "invalid_provider_config",
});

export class AffiliateOfferError extends Error {
  /**
   * @param {keyof typeof ERROR_CODES | string} code
   * @param {string} message
   * @param {ErrorOptions} [options]
   */
  constructor(code, message, options) {
    super(message, options);
    this.name = "AffiliateOfferError";
    this.code = code;
  }
}
