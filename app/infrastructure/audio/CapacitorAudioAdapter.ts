import { IAudioPort, ServiceStatus } from '../../core/audio/IAudioPort';
import { GainPacket } from '../../core/audio/GainPacket';
import { AudioControl } from '../../lib/native-audio-bridge';
import { ISoundRegistry } from '../../core/audio/ISoundRegistry';

/**
 * CapacitorAudioAdapter implements IAudioPort using the Capacitor native bridge.
 * This provides high-performance, background-capable audio for mobile platforms.
 * 
 * Pattern: Adapter (Hexagonal Architecture)
 */
export class CapacitorAudioAdapter implements IAudioPort {
  constructor(private readonly registry: ISoundRegistry) {}

  /**
   * Resolves sound ID to asset URL using the sound manifest.
   * 
   * @param soundId The unique identifier for the sound.
   * @returns The asset path or synthetic URL.
   */
  private resolveUrl(soundId: string): string {
    return this.registry.resolveUrl(soundId);
  }

  /**
   * Centralized error handling for native bridge calls.
   * 
   * @param operation The name of the operation that failed.
   * @param error The error object.
   * @param context Additional context for the error.
   */
  private handleError(operation: string, error: any, context?: any): void {
    // Silent fail in production
  }

  /**
   * Pre-loads a sound into memory for low-latency playback.
   * 
   * @param soundId The unique identifier for the sound.
   * @param url The source URL or path to the audio file.
   */
  async load(soundId: string, url: string): Promise<void> {
    // Native bridge currently handles loading implicitly in play()
  }

  /**
   * Unloads a sound from memory to free up resources.
   * 
   * @param soundId The unique identifier for the sound.
   */
  async unload(soundId: string): Promise<void> {
    // Native bridge currently handles unloading implicitly when stopped or replaced.
  }

  /**
   * Plays a sound.
   * 
   * @param soundId The unique identifier for the sound.
   * @param volume The volume level (0.0 to 1.0).
   * @param loop Whether the sound should loop continuously.
   */
  async play(soundId: string, volume: number, loop?: boolean): Promise<void> {
    if (!soundId) {
      this.handleError('play', 'soundId is required');
      return;
    }

    try {
      const url = this.resolveUrl(soundId);
      await AudioControl.play({ soundId, url, volume, loop });
    } catch (error) {
      this.handleError('play', error, { soundId, volume, loop });
    }
  }

  /**
   * Stops a sound.
   * Calls the native AudioControl.stop.
   *
   * @param soundId The unique identifier for the sound.
   */
  async stop(soundId: string): Promise<void> {
    if (!soundId) {
      this.handleError('stop', 'soundId is required');
      return;
    }

    try {
      await AudioControl.stop({ soundId });
    } catch (error) {
      this.handleError('stop', error, { soundId });
    }
  }

  /**
   * Stops all currently playing sounds.
   */
  async stopAll(): Promise<void> {
    try {
      await AudioControl.stopAll();
    } catch (error) {
      this.handleError('stopAll', error);
    }
  }

  /**
   * Updates the volume for a currently playing sound.
   * Uses the Capacitor AudioControl plugin to update the volume on the native side.
   *
   * @param soundId The unique identifier for the sound.
   * @param volume The new volume level (0.0 to 1.0) or a GainPacket.
   */
  async setVolume(soundId: string, volume: number | GainPacket): Promise<void> {
    if (!soundId) {
      this.handleError('setVolume', 'soundId is required');
      return;
    }

    const targetVolume = typeof volume === 'number' ? volume : volume.targetGain;
    
    try {
      // Currently the native bridge only supports a single volume number.
      // Future updates to the bridge will support the full GainPacket for native ramping.
      await AudioControl.setVolume({ soundId, volume: targetVolume });
    } catch (error) {
      this.handleError('setVolume', error, { soundId, targetVolume });
    }
  }

  /**
   * Sets the master volume for all sounds.
   * 
   * @param volume The master volume level (0.0 to 1.0).
   * @param _options Optional configuration (unused in native adapter).
   */
  async setMasterVolume(volume: number, _options?: { skipSync?: boolean }): Promise<void> {
    // Native bridge currently doesn't have a global master volume, 
    // it's handled by the OS or individual track volumes.
  }

  /**
   * Initializes the audio session.
   */
  async initialize(): Promise<void> {
    try {
      await AudioControl.initializeSession();
    } catch (error) {
      this.handleError('initialize', error);
    }
  }

  /**
   * Resumes the audio context if it was suspended.
   */
  async resume(): Promise<void> {
    // On native, this is usually handled by the OS when the app returns to foreground,
    // but we can trigger a session re-activation if needed.
    try {
      await AudioControl.initializeSession();
    } catch (error) {
      this.handleError('resume', error);
    }
  }

  async getServiceStatus(): Promise<ServiceStatus> {
    try {
      const status = await AudioControl.getServiceStatus();
      return {
        timeLeft: status.timeLeft,
        isRunning: status.isRunning,
        isPlaying: status.isPlaying,
        tracksPlayingCount: status.tracksPlayingCount
      };
    } catch (error) {
      this.handleError('getServiceStatus', error);
      return {
        timeLeft: 0,
        isRunning: false,
        isPlaying: false,
        tracksPlayingCount: 0
      };
    }
  }

  /**
   * Retrieves the IDs of all currently active sounds.
   * Note: The native bridge currently doesn't expose the list of active sound IDs,
   * so we return an empty array. The application layer (AudioPort) tracks this state.
   */
  getActiveSounds(): string[] {
    return [];
  }
}
