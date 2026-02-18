import { ISoundRegistry } from '../../core/audio/ISoundRegistry';
import { SoundMap } from '../../../src/core/audio/SoundMap';

/**
 * SoundRegistry implements ISoundRegistry by mapping sound IDs to assets
 * defined in SoundMap.
 *
 * Pattern: Registry (Infrastructure Layer)
 */
export class SoundRegistry implements ISoundRegistry {
  /**
   * Resolves a sound ID to its asset URL.
   * 
   * @param soundId - The unique identifier for the sound
   * @returns The URL or path to the sound asset
   */
  resolveUrl(soundId: string): string {
    const entry = SoundMap.getById(soundId);
    
    if (!entry) {
      return `sounds/${soundId}.mp3`;
    }
    
    // Synthetic sounds use the synthetic:// protocol
    if (entry.type === 'synthetic') {
      const color = entry.syntheticConfig?.color || soundId;
      return `synthetic://${color}`;
    }
    
    // File-based sounds use their audioUrl property
    if (entry.type === 'file') {
      return entry.audioUrl!;
    }
    
    // Fallback to default path
    return `sounds/${soundId}.mp3`;
  }

  /**
   * Checks if a sound is synthetic.
   * 
   * @param soundId - The unique identifier for the sound
   * @returns True if the sound is synthetic
   */
  isSynthetic(soundId: string): boolean {
    const entry = SoundMap.getById(soundId);
    return entry?.type === 'synthetic';
  }
}
