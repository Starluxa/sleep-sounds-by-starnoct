/**
 * Domain Types for the Mix Entity System
 * 
 * This module defines the core domain language for managing audio mixes,
 * with support for delta updates to minimize bridge overhead and prevent
 * V8 Major GC pauses that cause audio stuttering.
 * 
 * All interfaces use readonly modifiers to enforce immutability at the
 * type level, ensuring unidirectional data flow and predictable state management.
 * 
 * @module src/domain/sounds/types
 */

/**
 * Represents a single track within a mix.
 * Tracks are immutable value objects that can only be replaced, never modified.
 */
export interface ISoundItem {
  /** Unique identifier for the sound (e.g., 'rain', 'thunder') */
  readonly id: string;

  /** Volume level from 0 to 100 */
  readonly volume: number;

  /** Timestamp when the track was added to the mix (for ordering) */
  readonly addedAt: number;
}

/**
 * Discriminated union type for mix delta updates.
 * 
 * Deltas represent small, targeted changes to the mix state rather than
 * full state snapshots. This reduces serialization overhead and minimizes
 * garbage collection pressure in the V8 engine.
 */
export type MixDelta =
  | VolumeDelta
  | AddTrackDelta
  | RemoveTrackDelta
  | MasterVolumeDelta;

/**
 * Volume change delta for individual tracks.
 * Used for high-frequency volume slider updates.
 */
export interface VolumeDelta {
  readonly type: 'volume';
  readonly trackId: string;
  readonly volume: number;
}

/**
 * Delta for adding a new track to the mix.
 */
export interface AddTrackDelta {
  readonly type: 'addTrack';
  readonly track: ISoundItem;
}

/**
 * Delta for removing a track from the mix.
 */
export interface RemoveTrackDelta {
  readonly type: 'removeTrack';
  readonly trackId: string;
}

/**
 * Delta for changing the master volume.
 */
export interface MasterVolumeDelta {
  readonly type: 'masterVolume';
  readonly volume: number;
}

/**
 * Complete mix state interface.
 * 
 * This represents the full state of a mix at any point in time.
 * All properties are readonly to enforce immutability - state changes
 * must create new state objects rather than mutating existing ones.
 */
export interface IMixState {
  /** Array of tracks in the mix (readonly to prevent mutations) */
  readonly tracks: readonly ISoundItem[];

  /** Master volume level from 0 to 100 */
  readonly masterVolume: number;

  /** Timestamp when the mix was first created */
  readonly createdAt: number;

  /** Timestamp of the last modification to the mix */
  readonly updatedAt: number;
}

/**
 * Data Transfer Object for mix serialization and persistence.
 * 
 * MixDTO is a plain JavaScript object that can be safely serialized
 * with JSON.stringify/parse. It has the same shape as IMixState but
 * is explicitly designed for storage and transmission.
 * 
 * Note: This is intentionally a separate type to allow for future
 * optimizations (e.g., compression, versioning) without affecting
 * the domain model.
 */
export interface MixDTO {
  /** Serialized tracks array */
  tracks: Array<{
    id: string;
    volume: number;
    addedAt: number;
  }>;

  /** Master volume level */
  masterVolume: number;

  /** Creation timestamp */
  createdAt: number;

  /** Last update timestamp */
  updatedAt: number;

  /** Optional version identifier for migration support */
  version?: number;
}

/**
 * Error codes for mix-related operations.
 * 
 * Using typed error codes enables precise error handling and
 * user-friendly error messages without coupling the domain to
 * presentation concerns.
 */
export enum MixErrorCode {
  /** Attempted to add more tracks than the maximum allowed limit */
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',

  /** Attempted to add a track that already exists in the mix */
  DUPLICATE_TRACK = 'DUPLICATE_TRACK',

  /** Attempted to access or modify a track that doesn't exist */
  TRACK_NOT_FOUND = 'TRACK_NOT_FOUND',

  /** Attempted an operation on an empty mix that requires tracks */
  MIX_EMPTY = 'MIX_EMPTY',

  /** Invalid volume value (outside 0-100 range) */
  INVALID_VOLUME = 'INVALID_VOLUME',

  /** Invalid track ID format */
  INVALID_TRACK_ID = 'INVALID_TRACK_ID',
}

/**
 * Type guard to check if a value is a valid MixDelta.
 * Useful for runtime validation of bridge messages.
 */
export function isMixDelta(value: unknown): value is MixDelta {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const delta = value as Record<string, unknown>;

  if (typeof delta.type !== 'string') {
    return false;
  }

  switch (delta.type) {
    case 'volume':
      return (
        typeof delta.trackId === 'string' &&
        typeof delta.volume === 'number'
      );
    case 'addTrack':
      return (
        typeof delta.track === 'object' &&
        delta.track !== null &&
        'id' in delta.track &&
        'volume' in delta.track &&
        'addedAt' in delta.track
      );
    case 'removeTrack':
      return typeof delta.trackId === 'string';
    case 'masterVolume':
      return typeof delta.volume === 'number';
    default:
      return false;
  }
}

/**
 * Type guard to check if a value is a valid ISoundItem.
 */
export function isSoundItem(value: unknown): value is ISoundItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.volume === 'number' &&
    typeof item.addedAt === 'number'
  );
}

/**
 * Type guard to check if a value is a valid MixDTO.
 */
export function isMixDTO(value: unknown): value is MixDTO {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const dto = value as Record<string, unknown>;

  if (!Array.isArray(dto.tracks)) {
    return false;
  }

  if (
    typeof dto.masterVolume !== 'number' ||
    typeof dto.createdAt !== 'number' ||
    typeof dto.updatedAt !== 'number'
  ) {
    return false;
  }

  // Validate all tracks
  return dto.tracks.every((track) => isSoundItem(track));
}

/**
 * Converts an IMixState to a MixDTO for serialization.
 * This is a pure function that creates a new plain object.
 */
export function toMixDTO(state: IMixState): MixDTO {
  return {
    tracks: state.tracks.map((track) => ({
      id: track.id,
      volume: track.volume,
      addedAt: track.addedAt,
    })),
    masterVolume: state.masterVolume,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    version: 1, // Current DTO version for migration support
  };
}

/**
 * Converts a MixDTO back to IMixState.
 * This restores the readonly array type after deserialization.
 */
export function fromMixDTO(dto: MixDTO): IMixState {
  return {
    tracks: Object.freeze(dto.tracks.map((track) => Object.freeze(track))),
    masterVolume: dto.masterVolume,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
