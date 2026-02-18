import { IAudioPort, ServiceStatus } from '../../core/audio/IAudioPort';
import { GainPacket } from '../../core/audio/GainPacket';
import { ISoundRegistry } from '../../core/audio/ISoundRegistry';

/**
 * NullAudioAdapter is a "safe" mock implementation of IAudioPort.
 * It performs no actual audio operations, making it ideal for testing
 * or environments where audio output is not desired.
 */
export class NullAudioAdapter implements IAudioPort {
  constructor(private readonly registry?: ISoundRegistry) {}

  /**
   * Simulates loading a sound.
   * @param soundId The unique identifier for the sound.
   * @param url The source URL or path to the audio file.
   */
  async load(soundId: string, url: string): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates unloading a sound.
   * @param soundId The unique identifier for the sound.
   */
  async unload(soundId: string): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates playing a sound.
   * @param soundId The unique identifier for the sound.
   * @param volume The volume level.
   * @param loop Whether the sound should loop.
   */
  async play(soundId: string, volume: number, loop?: boolean): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates stopping a sound.
   * @param soundId The unique identifier for the sound.
   */
  async stop(soundId: string): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates stopping all sounds.
   */
  async stopAll(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates setting the volume for a sound.
   * @param soundId The unique identifier for the sound.
   * @param volume The new volume level or GainPacket.
   */
  async setVolume(soundId: string, volume: number | GainPacket): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates setting the master volume.
   * @param volume The master volume level.
   * @param options Optional configuration for the volume update.
   */
  async setMasterVolume(volume: number, options?: { skipSync?: boolean }): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates initializing the audio session.
   */
  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulates resuming the audio context.
   */
  async resume(): Promise<void> {
  }

  /**
   * Simulates initializing the audio session (legacy).
   * @deprecated Use initialize() instead.
   */
  async initializeSession(): Promise<void> {
    return this.initialize();
  }

  async getServiceStatus(): Promise<ServiceStatus> {
    return {
      timeLeft: 0,
      isRunning: false,
      isPlaying: false,
      tracksPlayingCount: 0
    };
  }

  /**
   * Simulates retrieving active sounds.
   */
  getActiveSounds(): string[] {
    return [];
  }
}
