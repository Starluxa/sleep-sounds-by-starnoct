/**
 * Application Layer - Sounds Module
 * 
 * This module contains use cases and ports for the sounds/audio mixing feature.
 * Following Hexagonal Architecture (Ports and Adapters), this layer orchestrates
 * domain logic while remaining independent of infrastructure concerns.
 * 
 * @module src/application/sounds
 */

// Export use cases
export { SyncMixUseCase } from './use-cases/SyncMixUseCase';

// Export ports (interfaces)
export type { IAudioPort } from './ports/IAudioPort';
