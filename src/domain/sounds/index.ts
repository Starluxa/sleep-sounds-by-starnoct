/**
 * Domain Layer - Sounds Module
 * 
 * This module contains all domain entities, value objects, and domain errors
 * for the sounds/audio mixing feature. Following Domain-Driven Design principles,
 * this layer is pure and has no dependencies on external frameworks or UI.
 * 
 * @module src/domain/sounds
 */

// Export entities
export { MixEntity } from './entities/MixEntity';
export { SoundEntity } from './entities/SoundEntity';

// Export domain errors
export { MixDomainError } from './errors/MixDomainError';
export { LuxDomainError } from './errors/LuxDomainError';

// Export types
export type {
  IMixState,
  ISoundItem,
  MixDTO,
  VolumeDelta,
  MixErrorCode,
} from './types';

// Re-export types namespace for convenience
export * from './types';
