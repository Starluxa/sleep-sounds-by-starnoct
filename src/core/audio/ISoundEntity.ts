/**
 * Pure Domain Entity representing a Sound.
 * Strictly void of any UI, Framework, or Native imports.
 */

export type SoundId = string;

/**
 * Volume level from 0 to 100.
 */
export type Volume = number;

export type SoundCategory = 
  | 'nature' 
  | 'white-noise' 
  | 'brown-noise' 
  | 'pink-noise' 
  | 'music' 
  | 'voices' 
  | 'rain'
  | 'thunder'
  | 'waterways'
  | 'ocean'
  | 'forest'
  | 'creatures'
  | 'fire'
  | 'color-noise'
  | 'ambient'
  | 'other';

export type SoundType = 'file' | 'synthetic';

export interface ISoundEntity {
  readonly id: SoundId;
  readonly name: string;
  readonly category: SoundCategory;
  readonly type: SoundType;
  readonly volume: Volume;
  readonly icon?: string;
  readonly audioUrl?: string;
  readonly metadata?: Record<string, unknown>;
}
