import { IAudioPort } from '../../core/audio/IAudioPort';
import { CapacitorAudioAdapter } from './CapacitorAudioAdapter';
import { WebAudioAdapter } from './WebAudioAdapter';
import { NullAudioAdapter } from './NullAudioAdapter';
import { SoundRegistry } from './SoundRegistry';
import { Capacitor } from '@capacitor/core';

/**
 * Configuration for the audio engine.
 */
export interface AudioEngineConfig {
  masterVolume?: number;
  debug?: boolean;
  engine?: 'web' | 'native' | 'null';
}

/**
 * AudioEngineFactory is responsible for creating and managing the singleton instance of IAudioPort.
 * It selects the appropriate adapter based on the current platform.
 */
export class AudioEngineFactory {
  private static instance: IAudioPort | null = null;

  /**
   * Returns the singleton instance of the audio engine.
   * @param config Optional configuration for the engine.
   * @returns An implementation of IAudioPort.
   */
  static getInstance(config?: AudioEngineConfig): IAudioPort {
    if (!this.instance) {
      this.instance = this.createEngine(config);
    }
    return this.instance;
  }

  /**
   * Creates an instance of an audio engine based on the platform.
   * @param config Optional configuration.
   * @returns An implementation of IAudioPort.
   */
  private static createEngine(config?: AudioEngineConfig): IAudioPort {
    const registry = new SoundRegistry();
    
    // 1. Handle SSR (Server-Side Rendering)
    if (typeof window === 'undefined') {
      return new NullAudioAdapter(registry);
    }

    // 2. Respect explicit engine override if provided
    if (config?.engine === 'web') {
      return new WebAudioAdapter(registry);
    }
    if (config?.engine === 'native') {
      return new CapacitorAudioAdapter(registry);
    }
    if (config?.engine === 'null') {
      return new NullAudioAdapter(registry);
    }

    // 3. Default platform detection
    let adapter: IAudioPort;
    
    if (Capacitor.isNativePlatform()) {
      adapter = new CapacitorAudioAdapter(registry);
    } else {
      adapter = new WebAudioAdapter(registry);
    }

    // Apply initial config if provided
    if (config?.masterVolume !== undefined) {
      adapter.setMasterVolume(config.masterVolume);
    }

    return adapter;
  }

  /**
   * Resets the singleton instance (primarily for testing).
   */
  static reset(): void {
    this.instance = null;
  }
}
