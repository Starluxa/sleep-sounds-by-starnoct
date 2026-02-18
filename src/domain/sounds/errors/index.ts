/**
 * Domain Errors Module
 *
 * This module exports all domain-specific error classes for the sounds domain.
 * Centralizing error exports makes it easier for consumers to import the errors
 * they need for type checking and error handling.
 *
 * @module src/domain/sounds/errors
 *
 * @example
 * ```typescript
 * import { LuxDomainError, MixDomainError } from '@/domain/sounds/errors';
 *
 * try {
 *   mix.addTrack(track);
 * } catch (error) {
 *   if (error instanceof MixDomainError) {
 *     // Handle mix-specific errors
 *     console.log(error.code); // MixErrorCode.LIMIT_EXCEEDED
 *   }
 * }
 * ```
 */

export { LuxDomainError } from './LuxDomainError';
export { MixDomainError } from './MixDomainError';
