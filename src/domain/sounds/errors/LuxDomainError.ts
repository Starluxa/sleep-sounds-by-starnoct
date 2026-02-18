/**
 * Base error class for Domain-level violations.
 * Used for Fail-Fast validation and business rule enforcement.
 */
export class LuxDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LuxDomainError';
    
    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, LuxDomainError.prototype);

    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LuxDomainError);
    }
  }
}
