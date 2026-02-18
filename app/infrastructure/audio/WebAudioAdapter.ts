import { IAudioPort, ServiceStatus } from '../../core/audio/IAudioPort';
import { GainPacket } from '../../core/audio/GainPacket';
import { ISoundRegistry } from '../../core/audio/ISoundRegistry';
import { audioEventBus } from '../../core/audio/AudioEventBus';

/**
 * WebAudioAdapter implements IAudioPort using standard HTML5 Audio elements.
 * This provides a fallback for web browsers when native audio is not available.
 *
 * Pattern: Adapter (Hexagonal Architecture)
 */
export class WebAudioAdapter implements IAudioPort {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private soundVolumes: Map<string, number> = new Map();
  private eventListeners: Map<string, Map<string, EventListener>> = new Map();
  private masterVolume: number = 1.0;

  constructor(private readonly registry: ISoundRegistry) {}

  /**
   * Pre-loads a sound into memory.
   */
  async load(soundId: string, url: string): Promise<void> {
    if (typeof document === 'undefined') return;

    // Silently skip synthetic sounds
    if (this.registry.isSynthetic(soundId)) return;

    if (this.audioElements.has(soundId)) {
      return;
    }

    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Hook into audio element events to notify the application layer
      const onLoadStart = () => {
        audioEventBus.emit('loading_started', { soundId });
      };
      
      const onCanPlay = () => {
        audioEventBus.emit('loading_finished', { soundId });
      };
      
      const onError = () => {
        const error = audio.error?.message || 'Failed to load audio';
        audioEventBus.emit('loading_error', { soundId, error });
      };

      audio.addEventListener('loadstart', onLoadStart);
      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);

      // Store listeners for cleanup
      const listeners = new Map<string, EventListener>();
      listeners.set('loadstart', onLoadStart as EventListener);
      listeners.set('canplay', onCanPlay as EventListener);
      listeners.set('error', onError as EventListener);
      this.eventListeners.set(soundId, listeners);

      // Start loading
      audio.load();
      
      this.audioElements.set(soundId, audio);
      this.soundVolumes.set(soundId, 1.0);
    } catch (error) {
      // Silent fail in production
    }
  }

  /**
   * Unloads a sound from memory.
   */
  async unload(soundId: string): Promise<void> {
    const audio = this.audioElements.get(soundId);
    if (audio) {
      audio.pause();

      // Remove event listeners
      const listeners = this.eventListeners.get(soundId);
      if (listeners) {
        listeners.forEach((listener, event) => {
          audio.removeEventListener(event, listener);
        });
        this.eventListeners.delete(soundId);
      }

      audio.src = '';
      audio.load(); // Force release of resources
      this.audioElements.delete(soundId);
      this.soundVolumes.delete(soundId);
    }
  }

  /**
   * Plays a sound.
   *
   * @param soundId The unique identifier for the sound.
   * @param volume The volume level (0.0 to 1.0).
   * @param loop Whether the sound should loop.
   */
  async play(soundId: string, volume: number, loop?: boolean): Promise<void> {
    if (typeof document === 'undefined') return;
    
    // Silently skip synthetic sounds
    if (this.registry.isSynthetic(soundId)) return;

    let audio = this.audioElements.get(soundId);
    
    if (!audio) {
      // Auto-load if not already loaded
      const url = this.registry.resolveUrl(soundId);
      await this.load(soundId, url);
      audio = this.audioElements.get(soundId);
    }

    if (!audio) {
      return;
    }

    try {
      this.soundVolumes.set(soundId, volume);
      audio.volume = volume * this.masterVolume;
      if (loop !== undefined) {
        audio.loop = loop;
      }
      
      // Reset to beginning if already playing or ended
      if (audio.ended || audio.paused) {
        audio.currentTime = 0;
      }
      
      await audio.play();

      // Update MediaSession state
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } catch (error) {
      // Silent fail in production
    }
  }

  /**
   * Stops a sound.
   */
  async stop(soundId: string): Promise<void> {
    const audio = this.audioElements.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;

      // Update MediaSession state if no sounds are playing
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        const isAnyPlaying = Array.from(this.audioElements.values()).some(a => !a.paused);
        if (!isAnyPlaying) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    }
  }

  /**
   * Stops all currently playing sounds.
   */
  async stopAll(): Promise<void> {
    this.audioElements.forEach((audio, soundId) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        // Silent fail
      }
    });

    // Update MediaSession state if available
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  }

  /**
   * Updates the volume for a currently playing sound.
   */
  async setVolume(soundId: string, volume: number | GainPacket): Promise<void> {
    const audio = this.audioElements.get(soundId);
    if (audio) {
      const targetVolume = typeof volume === 'number' ? volume : volume.targetGain;
      this.soundVolumes.set(soundId, targetVolume);
      audio.volume = targetVolume * this.masterVolume;
    }
  }

  /**
   * Sets the master volume for all sounds.
   * @param volume The master volume level (0.0 to 1.0).
   * @param options Optional configuration for the volume update.
   */
  async setMasterVolume(volume: number, options?: { skipSync?: boolean }): Promise<void> {
    this.masterVolume = volume;
    
    if (options?.skipSync) {
      return;
    }

    // Update all currently playing sounds
    this.audioElements.forEach((audio, soundId) => {
      const individualVolume = this.soundVolumes.get(soundId) ?? 1.0;
      audio.volume = individualVolume * this.masterVolume;
    });
  }

  /**
   * Initializes the audio session.
   */
  async initialize(): Promise<void> {
    await this.initializeSession();
  }

  /**
   * Resumes the audio context.
   */
  async resume(): Promise<void> {
    // Web Audio context resume logic would go here if using Web Audio API.
    // For HTMLAudioElement, it's usually not needed.
  }

  /**
   * Initializes the audio session with MediaSession metadata.
   */
  private async initializeSession(): Promise<void> {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Sleep Sounds',
        artist: 'StarNoct',
        album: 'Relaxation',
        artwork: [
          { src: '/favicon.png', sizes: '512x512', type: 'image/png' }
        ]
      });
    }
  }

  async getServiceStatus(): Promise<ServiceStatus> {
    const isPlaying = Array.from(this.audioElements.values()).some(audio => !audio.paused);
    return {
      timeLeft: 0,
      isRunning: isPlaying,
      isPlaying: isPlaying,
      tracksPlayingCount: this.audioElements.size
    };
  }

  /**
   * Retrieves the IDs of all currently active sounds.
   */
  getActiveSounds(): string[] {
    return Array.from(this.audioElements.keys());
  }
}
