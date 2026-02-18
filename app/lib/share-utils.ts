import { ActiveSound } from '@/types/sounds';
import { soundCategories } from '@/data/soundsData';

/**
 * Encodes an array of active sounds into a compact, URL-safe Base64 string.
 * Filters out sounds with volume <= 0 to save URL space.
 * Format: soundId:volume pairs separated by underscores, then Base64 encoded.
 */
export function encodeMix(activeSounds: ActiveSound[]): string {
  // Filter sounds with volume > 0
  const filteredSounds = activeSounds.filter(sound => sound.volume > 0);

  // Create soundId:volume pairs
  const pairs = filteredSounds.map(sound => `${sound.id}:${sound.volume}`);

  // Join with underscores
  const serialized = pairs.join('_');

  // Encode to URL-safe Base64
  // Note: + and / are replaced with - and _ respectively to make the string URL-safe
  // (Standard Base64 uses + and / which can be misinterpreted in URLs)
  const base64 = btoa(serialized);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a URL-safe Base64 string back into an array of active sounds.
 * Validates sound IDs against available sounds and clamps volumes to 0-100.
 * Ignores invalid sound IDs.
 */
export function decodeMix(encoded: string): ActiveSound[] {
  try {
    // Decode URL-safe Base64
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const serialized = atob(base64);

    // Split by underscores
    const pairs = serialized.split('_');

    const activeSounds: ActiveSound[] = [];

    // Create a set of valid sound IDs for quick lookup
    const validSoundIds = new Set<string>();
    for (const category of soundCategories) {
      for (const sound of category.sounds) {
        validSoundIds.add(sound.id);
      }
    }

    for (const pair of pairs) {
      const [soundId, volumeStr] = pair.split(':');
      if (!soundId || !volumeStr) continue;

      // Validate sound ID
      if (!validSoundIds.has(soundId)) continue;

      // Parse and clamp volume
      const volume = Math.max(0, Math.min(100, parseInt(volumeStr, 10)));
      if (isNaN(volume)) continue;

      activeSounds.push({
        id: soundId,
        volume,
        isPlaying: true, // Default to playing
      });
    }

    return activeSounds;
  } catch (error) {
    // Return empty array for malformed strings
    return [];
  }
}
