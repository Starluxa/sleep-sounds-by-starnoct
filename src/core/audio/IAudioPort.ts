import { ISoundEntity, SoundId } from './ISoundEntity';

/**
 * Playback states for a sound.
 */
export enum PlaybackState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED'
}

/**
 * Commands that can be sent to the audio port.
 */
export type AudioCommand =
  | { type: 'PLAY'; sound: ISoundEntity }
  | { type: 'STOP'; soundId: SoundId }
  | { type: 'PAUSE_ALL' }
  | { type: 'RESUME_ALL' }
  | { type: 'SET_VOLUME'; soundId: SoundId; volume: number }
  | { type: 'SET_MASTER_VOLUME'; volume: number };

/**
 * IAudioPort defines the contract for the audio infrastructure.
 * It uses a command-based approach to decouple domain logic from implementation.
 */
export interface IAudioPort {
  /**
   * Executes an audio command.
   */
  execute(command: AudioCommand): Promise<void>;

  /**
   * Returns the current playback state of a sound.
   */
  getPlaybackState(soundId: SoundId): PlaybackState;

  /**
   * Returns all currently active sound IDs.
   */
  getActiveSounds(): SoundId[];

  /**
   * Disposes of the audio port and its resources.
   */
  dispose(): Promise<void>;
}
