import { GainPacket } from './GainPacket';

/**
 * ServiceStatus represents the current state of the native audio service.
 */
export interface ServiceStatus {
  timeLeft: number;
  isRunning: boolean;
  isPlaying?: boolean;
  tracksPlayingCount?: number;
}

/**
 * IAudioPort defines the contract for audio engine adapters.
 * This interface establishes how the core domain interacts with audio hardware or libraries.
 */
export interface IAudioPort {
  /**
   * Pre-loads a sound into memory for low-latency playback.
   * @param soundId The unique identifier for the sound.
   * @param url The source URL or path to the audio file.
   */
  load(soundId: string, url: string): Promise<void>;

  /**
   * Unloads a sound from memory to free up resources.
   * @param soundId The unique identifier for the sound.
   */
  unload(soundId: string): Promise<void>;

  /**
   * Plays a sound with the specified ID and volume.
   * @param soundId The unique identifier for the sound.
   * @param volume The volume level (0.0 to 1.0).
   * @param loop Whether the sound should loop continuously.
   */
  play(soundId: string, volume: number, loop?: boolean): Promise<void>;

  /**
   * Stops the sound with the specified ID.
   * @param soundId The unique identifier for the sound.
   */
  stop(soundId: string): Promise<void>;

  /**
   * Stops all currently playing sounds.
   */
  stopAll(): Promise<void>;

  /**
   * Updates the volume for a currently playing sound.
   * @param soundId The unique identifier for the sound.
   * @param volume The new volume level (0.0 to 1.0) or a GainPacket for ramping.
   */
  setVolume(soundId: string, volume: number | GainPacket): Promise<void>;

  /**
   * Sets the master volume for all sounds.
   * @param volume The master volume level (0.0 to 1.0).
   * @param options Optional configuration for the volume update.
   */
  setMasterVolume(volume: number, options?: { skipSync?: boolean }): Promise<void>;

  /**
   * Initializes the audio session, ensuring the audio context is ready.
   * This is typically required to handle browser/platform autoplay restrictions.
   */
  initialize(): Promise<void>;

  /**
   * Resumes the audio context if it was suspended.
   * Essential for handling Web Audio autoplay policies after user interaction.
   */
  resume(): Promise<void>;

  /**
   * Retrieves the current status of the audio service.
   * Useful for syncing UI state with native background processes.
   */
  getServiceStatus(): Promise<ServiceStatus>;

  /**
   * Retrieves the IDs of all currently active (playing or loaded) sounds.
   * Essential for synchronization logic to determine which sounds to stop.
   */
  getActiveSounds(): string[];
}
