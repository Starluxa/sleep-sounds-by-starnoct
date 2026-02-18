import { IAudioPort, ServiceStatus } from '../../core/audio/IAudioPort';
import { GainPacket } from '../../core/audio/GainPacket';
import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';
import { audioEventBus } from '../../core/audio/AudioEventBus';

/**
 * AudioPort is the application-layer implementation of IAudioPort.
 * It acts as a "Smart Port" that handles business logic such as:
 * - Throttling volume updates (60Hz)
 * - Calculating transient gain with headroom (via MixEntity)
 * - Coordinating state between the UI and the audio engine
 *
 * It wraps an underlying IAudioPort (the infrastructure adapter).
 */
export class AudioPort implements IAudioPort {
  private activeSounds: Map<string, number> = new Map(); // soundId -> trackVolume (0-100)
  private masterVolume: number = 100; // 0-100

  // Throttling state
  private pendingUpdates: Map<string, number> = new Map(); // soundId -> calculatedGain (0.0-1.0)
  private isThrottling: boolean = false;

  constructor(
    private engine: IAudioPort,
    private onPlaybackTerminated?: (soundId: string) => void
  ) {
    // Subscribe to playback termination events (e.g. from native focus loss)
    audioEventBus.subscribe('playback_terminated', (data) => {
      this.handlePlaybackTerminated(data.soundId);
    });
  }

  /**
   * Internal handler for playback termination events.
   */
  private handlePlaybackTerminated(soundId: string): void {
    this.activeSounds.delete(soundId);
    if (this.onPlaybackTerminated) {
      this.onPlaybackTerminated(soundId);
    }
  }

  async load(soundId: string, url: string): Promise<void> {
    return this.engine.load(soundId, url);
  }

  async unload(soundId: string): Promise<void> {
    this.activeSounds.delete(soundId);
    this.pendingUpdates.delete(soundId);
    return this.engine.unload(soundId);
  }

  /**
   * Plays a sound.
   * @param volume Volume level (0.0 to 1.0)
   */
  async play(soundId: string, volume: number, loop?: boolean): Promise<void> {
    const trackVolume = volume * 100;
    this.activeSounds.set(soundId, trackVolume);

    const gain = MixEntity.calculateTransientGain(
      trackVolume,
      this.masterVolume,
      this.activeSounds.size
    );

    return this.engine.play(soundId, gain, loop);
  }

  async stop(soundId: string): Promise<void> {
    this.activeSounds.delete(soundId);
    this.pendingUpdates.delete(soundId);
    return this.engine.stop(soundId);
  }

  async stopAll(): Promise<void> {
    this.activeSounds.clear();
    this.pendingUpdates.clear();
    this.isThrottling = false;
    return this.engine.stopAll();
  }

  /**
   * Updates volume for a sound.
   * @param volume Volume level (0.0 to 1.0) or GainPacket
   */
  async setVolume(soundId: string, volume: number | GainPacket): Promise<void> {
    if (typeof volume === 'number') {
      const trackVolume = volume * 100;
      this.activeSounds.set(soundId, trackVolume);

      const gain = MixEntity.calculateTransientGain(
        trackVolume,
        this.masterVolume,
        this.activeSounds.size
      );

      this.throttledSetVolume(soundId, gain);
    } else {
      // Update internal state if trackVolume is provided
      if ((volume as any).trackVolume !== undefined) {
        this.activeSounds.set(soundId, (volume as any).trackVolume);
      }
      
      // Pass GainPacket directly to engine
      return this.engine.setVolume(soundId, volume);
    }
  }

  /**
   * Sets master volume.
   * @param volume Master volume level (0.0 to 1.0)
   * @param options Optional configuration for the volume update.
   */
  async setMasterVolume(volume: number, options?: { skipSync?: boolean }): Promise<void> {
    this.masterVolume = volume * 100;
    
    if (options?.skipSync) {
      return;
    }

    // Sync all volumes to account for new master volume
    const trackCount = this.activeSounds.size;
    for (const [soundId, trackVolume] of this.activeSounds) {
      const gain = MixEntity.calculateTransientGain(
        trackVolume,
        this.masterVolume,
        trackCount
      );
      this.throttledSetVolume(soundId, gain);
    }

    // We do NOT call engine.setMasterVolume(volume) because MixEntity 
    // already incorporates master volume into the individual track gains.
    // Calling it on the engine would result in "Double Scaling".
  }

  async initialize(): Promise<void> {
    return this.engine.initialize();
  }

  async resume(): Promise<void> {
    return this.engine.resume();
  }

  async getServiceStatus(): Promise<ServiceStatus> {
    return this.engine.getServiceStatus();
  }

  /**
   * Retrieves the IDs of all currently active sounds.
   */
  getActiveSounds(): string[] {
    return Array.from(this.activeSounds.keys());
  }

  /**
   * Throttles volume updates to approximately 60Hz.
   */
  private throttledSetVolume(soundId: string, volume: number): void {
    this.pendingUpdates.set(soundId, volume);

    if (!this.isThrottling) {
      this.isThrottling = true;

      const schedule = typeof requestAnimationFrame !== 'undefined'
        ? requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16);

      schedule(() => this.flushUpdates());
    }
  }

  /**
   * Flushes pending updates to the engine.
   */
  private flushUpdates(): void {
    this.isThrottling = false;

    for (const [soundId, volume] of this.pendingUpdates) {
      // Safety check: only update volume if the sound is still active
      if (!this.activeSounds.has(soundId)) continue;

      const packet: GainPacket = {
        targetGain: volume,
        rampDurationMs: 16
      };
      this.engine.setVolume(soundId, packet);
    }

    this.pendingUpdates.clear();
  }
}
