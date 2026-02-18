import type { SoundState, SoundId } from '../../src/domain/sounds/dtos/SoundState';

interface BaseSound {
  id: SoundId;
  name: string;
  category: string;
  icon: string;
  image: string;
  duration?: number;
  description?: string;
  tags?: string[];
}

interface FileSound extends BaseSound {
  type: 'file';
  audioUrl: string;
}

export interface SyntheticSound extends BaseSound {
  type: 'synthetic';
  syntheticConfig: {
    color: 'white' | 'pink' | 'brown';
    filter?: {
      type: string;
      freq: number;
    };
    modulation?: {
      rate: number;
      depth: number;
    };
  };
}

export type Sound = FileSound | SyntheticSound;

export interface Category {
  id: string;
  name: string;
  icon: string;
  readonly sounds: readonly Sound[];
  description?: string;
}

/**
 * Strangler Fig Pattern: ActiveSound is now a mapped type based on SoundState.
 * This provides immediate type safety by re-exporting the Domain DTO
 * while maintaining backward compatibility with the legacy UI.
 *
 * Maps the domain's track.id directly to ActiveSound.id for consistency.
 *
 * Note: `type` is optional during the transition period to allow gradual migration.
 * New code should provide `type: 'file' | 'synthetic'` for full discriminated union support.
 */
export type ActiveSound = Readonly<
  Omit<SoundState, 'id' | 'category' | 'type'> & {
    id: SoundId;
    isPlaying?: boolean;
    startTime?: number;
    /**
     * Discriminant for sound type. Optional during migration.
     * - 'file': Sound loaded from audio file
     * - 'synthetic': Procedurally generated sound
     */
    type?: 'file' | 'synthetic';
    /**
     * URL for file sounds (included when type is 'file' or during migration).
     * @deprecated Use SoundState.audioUrl via proper type narrowing
     */
    audioUrl?: string;
  }
>;

type MixBase = {
  readonly id: string;
  readonly name: string;
  readonly sounds: readonly ActiveSound[];
  readonly createdAt: number;
};

export type Mix = MixBase;
export type LocalSavedMix = Mix;
export type SavedMix = MixBase & {
  readonly updatedAt: number;
  readonly userId?: string;
  readonly isPublic?: boolean;
};
export interface SoundTimer {
  soundId: SoundId;
  duration: number; // in seconds
  startTime?: number;
  isRunning: boolean;
}

export interface AudioSettings {
  /** Master volume level as an integer between 0 and 100. */
  volume: number;
  playbackRate?: number;
  loop: boolean;
}


export type SoundCategory = 'nature' | 'white-noise' | 'brown-noise' | 'pink-noise' | 'music' | 'voices' | 'other';
