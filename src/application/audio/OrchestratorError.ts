/**
 * Error codes for LuxAudioError to allow for programmatic handling.
 */
export type LuxAudioErrorCode = 
  | 'RANDOMIZATION_FAILED'
  | 'VALIDATION_REJECTED'
  | 'ORCHESTRATION_ERROR';

/**
 * Custom error class for the Audio Application Layer.
 * Prevents generic JS crashes from bubbling up to the UI and provides
 * specific context for audio-related failures.
 * 
 * Following Clean Architecture, this remains in the Application layer
 * as it coordinates errors from Domain and Infrastructure.
 */
export class LuxAudioError extends Error {
  public readonly code: LuxAudioErrorCode;
  public readonly metadata?: Record<string, any>;

  constructor(message: string, code: LuxAudioErrorCode, metadata?: Record<string, any>) {
    super(message);
    
    this.name = 'LuxAudioError';
    this.code = code;
    this.metadata = metadata;

    // Fix prototype chain for instanceof checks (TS best practice)
    Object.setPrototypeOf(this, LuxAudioError.prototype);

    // Capture stack trace (V8 specific, but safe in most modern environments)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LuxAudioError);
    }
  }
}
