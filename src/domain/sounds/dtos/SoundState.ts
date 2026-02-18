/**
 * Pure Data Transfer Object (DTO) for Sound State.
 * This is the "Source of Truth" for data storage and persistence.
 * It holds only primitive data to ensure zero-cost serialization/deserialization.
 * 
 * This interface is identical to the shape expected by Zustand's persist middleware.
 */

export type SoundId = string;

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

/**
 * Discriminated Union for Sound State.
 */
export type SoundState = FileSoundState | SyntheticSoundState;

interface BaseSoundState {
  readonly id: SoundId;
  readonly volume: number; // 0-100
  readonly category: SoundCategory;
}

export interface FileSoundState extends BaseSoundState {
  readonly type: 'file';
  readonly audioUrl: string;
}

export interface SyntheticSoundState extends BaseSoundState {
  readonly type: 'synthetic';
  readonly syntheticConfig: Record<string, unknown>;
}

/**
 * Lean object for Capacitor Bridge transmission.
 * Strips UI metadata to reduce serialization overhead.
 */
export interface SoundBridgePacket {
  readonly id: string;
  readonly url?: string;
  readonly volume: number;
  readonly syntheticConfig?: Record<string, unknown>;
}
