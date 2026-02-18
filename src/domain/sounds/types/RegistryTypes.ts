/**
 * SoundCategory defines the available groupings for sounds in the registry.
 */
export type SoundCategory = 
  | 'rain' 
  | 'forest' 
  | 'ocean' 
  | 'white-noise' 
  | 'meditation' 
  | 'urban' 
  | 'fire';

/**
 * Base interface for all sound definitions.
 * Contains common metadata and presentation fields.
 */
interface BaseSoundDefinition {
  readonly id: string;
  readonly category: SoundCategory;
  
  /**
   * Presentation Metadata
   * These fields are used for UI display and are not part of the core audio logic.
   */
  readonly presentation: {
    readonly name: string;
    readonly icon: string;
    readonly description?: string;
  };
}

/**
 * Definition for sounds backed by an audio file (e.g., MP3, WAV).
 */
export interface FileSoundDefinition extends BaseSoundDefinition {
  readonly type: 'file';
  readonly audioUrl: string;
}

/**
 * Definition for sounds generated synthetically (e.g., oscillators, noise generators).
 */
export interface SyntheticSoundDefinition extends BaseSoundDefinition {
  readonly type: 'synthetic';
  readonly syntheticConfig: {
    readonly oscillatorType: 'sine' | 'square' | 'sawtooth' | 'triangle';
    readonly baseFrequency: number;
    readonly modulation?: {
      readonly type: 'am' | 'fm';
      readonly frequency: number;
      readonly depth: number;
    };
  };
}

/**
 * Discriminated union of all possible sound definitions in the registry.
 */
export type SoundDefinition = FileSoundDefinition | SyntheticSoundDefinition;

/**
 * The SoundRegistry is a collection of SoundDefinitions indexed by their unique ID.
 */
export interface SoundRegistry {
  readonly [soundId: string]: SoundDefinition;
}
 * SoundCategory defines the available groupings for sounds in the registry.
 */
export type SoundCategory = 
  | 'rain' 
  | 'forest' 
  | 'ocean' 
  | 'white-noise' 
  | 'meditation' 
  | 'urban' 
  | 'fire';

/**
 * Base interface for all sound definitions.
 * Contains common metadata and presentation fields.
 */
interface BaseSoundDefinition {
  readonly id: string;
  readonly category: SoundCategory;
  
  /**
   * Presentation Metadata
   * These fields are used for UI display and are not part of the core audio logic.
   */
  readonly presentation: {
    readonly name: string;
    readonly icon: string;
    readonly description?: string;
  };
}

/**
 * Definition for sounds backed by an audio file (e.g., MP3, WAV).
 */
export interface FileSoundDefinition extends BaseSoundDefinition {
  readonly type: 'file';
  readonly audioUrl: string;
}

/**
 * Definition for sounds generated synthetically (e.g., oscillators, noise generators).
 */
export interface SyntheticSoundDefinition extends BaseSoundDefinition {
  readonly type: 'synthetic';
  readonly syntheticConfig: {
    readonly oscillatorType: 'sine' | 'square' | 'sawtooth' | 'triangle';
    readonly baseFrequency: number;
    readonly modulation?: {
      readonly type: 'am' | 'fm';
      readonly frequency: number;
      readonly depth: number;
    };
  };
}

/**
 * Discriminated union of all possible sound definitions in the registry.
 */
export type SoundDefinition = FileSoundDefinition | SyntheticSoundDefinition;

/**
 * The SoundRegistry is a collection of SoundDefinitions indexed by their unique ID.
 */
export interface SoundRegistry {
  readonly [soundId: string]: SoundDefinition;
}

