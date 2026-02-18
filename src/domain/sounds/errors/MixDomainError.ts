/**
 * MixDomainError - Specialized error class for Mix-related domain violations.
 *
 * This class extends LuxDomainError to provide rich context about mix-specific
 * errors, enabling precise error handling and user-friendly error messages.
 * It includes error codes, track IDs, and count information to help the UI
 * display appropriate feedback (e.g., "Limit Reached" toast).
 *
 * Following Domain-Driven Design principles:
 * - Fail-Fast validation with clear error codes
 * - Static factory methods for common error scenarios
 * - Rich context for debugging and user feedback
 *
 * @module src/domain/sounds/errors
 */

import { LuxDomainError } from './LuxDomainError';
import { MixErrorCode } from '../types';

/**
 * Parameters for creating a MixDomainError.
 */
interface MixDomainErrorParams {
  /** The specific error code for this error type */
  code: MixErrorCode;
  /** Human-readable error message */
  message: string;
  /** Optional track ID associated with the error */
  trackId?: string;
  /** Optional current count value (e.g., current track count) */
  currentCount?: number;
  /** Optional maximum allowed value (e.g., MAX_TRACKS limit) */
  maxAllowed?: number;
}

/**
 * Specialized domain error for Mix-related violations.
 *
 * This error class provides structured error information including:
 * - Error codes for programmatic handling
 * - Track IDs for pinpointing issues
 * - Count information for limit-related errors
 *
 * @example
 * ```typescript
 * // Using factory method
 * throw MixDomainError.limitExceeded(10, 10);
 *
 * // Using constructor
 * throw new MixDomainError({
 *   code: MixErrorCode.INVALID_VOLUME,
 *   message: 'Volume must be between 0 and 100',
 *   currentCount: 150
 * });
 * ```
 */
export class MixDomainError extends LuxDomainError {
  /** The specific error code for this error */
  public readonly code: MixErrorCode;

  /** Optional track ID associated with the error */
  public readonly trackId?: string;

  /** Optional current count value for limit errors */
  public readonly currentCount?: number;

  /** Optional maximum allowed value for limit errors */
  public readonly maxAllowed?: number;

  /**
   * Creates a new MixDomainError with rich context.
   *
   * @param params - Error parameters including code, message, and optional context
   *
   * @example
   * ```typescript
   * throw new MixDomainError({
   *   code: MixErrorCode.LIMIT_EXCEEDED,
   *   message: 'Cannot add more tracks',
   *   currentCount: 10,
   *   maxAllowed: 10
   * });
   * ```
   */
  constructor(params: MixDomainErrorParams) {
    super(params.message);
    this.name = 'MixDomainError';
    this.code = params.code;
    this.trackId = params.trackId;
    this.currentCount = params.currentCount;
    this.maxAllowed = params.maxAllowed;

    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, MixDomainError.prototype);

    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MixDomainError);
    }
  }

  /**
   * Creates an error for when the track limit is exceeded.
   *
   * Use this when attempting to add a track but the mix is already at capacity.
   * The UI can catch this and show a "Limit Reached" toast.
   *
   * @param current - The current number of tracks
   * @param max - The maximum allowed tracks
   * @returns A configured MixDomainError
   *
   * @example
   * ```typescript
   * if (this.isFull) {
   *   throw MixDomainError.limitExceeded(this.trackCount, MixEntity.getMaxTracks());
   * }
   * ```
   */
  static limitExceeded(current: number, max: number): MixDomainError {
    return new MixDomainError({
      code: MixErrorCode.LIMIT_EXCEEDED,
      message: `Cannot add track: limit exceeded (${current}/${max} tracks). ` +
        `Please remove a track before adding a new one.`,
      currentCount: current,
      maxAllowed: max,
    });
  }

  /**
   * Creates an error for when attempting to add a duplicate track.
   *
   * Use this when a track with the same ID already exists in the mix.
   *
   * @param trackId - The ID of the duplicate track
   * @returns A configured MixDomainError
   *
   * @example
   * ```typescript
   * if (this.hasTrack(trackId)) {
   *   throw MixDomainError.duplicateTrack(trackId);
   * }
   * ```
   */
  static duplicateTrack(trackId: string): MixDomainError {
    return new MixDomainError({
      code: MixErrorCode.DUPLICATE_TRACK,
      message: `Cannot add track "${trackId}": track already exists in the mix. ` +
        `Remove the existing track first or adjust its volume.`,
      trackId,
    });
  }

  /**
   * Creates an error for when a track is not found.
   *
   * Use this when attempting to access or modify a track that doesn't exist.
   *
   * @param trackId - The ID of the missing track
   * @returns A configured MixDomainError
   *
   * @example
   * ```typescript
   * const track = this.getTrack(trackId);
   * if (!track) {
   *   throw MixDomainError.trackNotFound(trackId);
   * }
   * ```
   */
  static trackNotFound(trackId: string): MixDomainError {
    return new MixDomainError({
      code: MixErrorCode.TRACK_NOT_FOUND,
      message: `Track "${trackId}" not found in the mix. ` +
        `It may have been removed or the ID may be incorrect.`,
      trackId,
    });
  }

  /**
   * Creates an error for invalid volume values.
   *
   * Use this when a volume value is outside the valid range (0-100).
   *
   * @param volume - The invalid volume value
   * @returns A configured MixDomainError
   *
   * @example
   * ```typescript
   * if (volume < 0 || volume > 100) {
   *   throw MixDomainError.invalidVolume(volume);
   * }
   * ```
   */
  static invalidVolume(volume: number): MixDomainError {
    return new MixDomainError({
      code: MixErrorCode.INVALID_VOLUME,
      message: `Invalid volume: ${volume}. Volume must be between 0 and 100.`,
      currentCount: volume,
      maxAllowed: 100,
    });
  }

  /**
   * Creates an error for invalid track ID format.
   *
   * Use this when a track ID is empty or not a valid string.
   *
   * @param trackId - The invalid track ID
   * @returns A configured MixDomainError
   *
   * @example
   * ```typescript
   * if (!trackId || typeof trackId !== 'string') {
   *   throw MixDomainError.invalidTrackId(trackId);
   * }
   * ```
   */
  static invalidTrackId(trackId: unknown): MixDomainError {
    return new MixDomainError({
      code: MixErrorCode.INVALID_TRACK_ID,
      message: `Invalid track ID: "${String(trackId)}". ` +
        `Track ID must be a non-empty string.`,
      trackId: String(trackId),
    });
  }

  /**
   * Creates an error for operations that require tracks but the mix is empty.
   *
   * @returns A configured MixDomainError
   *
   * @example
   * ```typescript
   * if (this.isEmpty) {
   *   throw MixDomainError.mixEmpty();
   * }
   * ```
   */
  static mixEmpty(): MixDomainError {
    return new MixDomainError({
      code: MixErrorCode.MIX_EMPTY,
      message: 'Operation failed: mix is empty. Add at least one track first.',
    });
  }
}
