import { RAW_SOUND_DATA } from '../../data/sounds/SoundManifest';

/**
 * SoundRegistry
 * 
 * Domain Service for sound lookups.
 * Replaces the old SoundMap.ts with a pure, data-driven approach.
 * 
 * Pattern: Domain Service / Registry
 * This class provides O(1) lookups for sounds by ID and efficient filtering by category.
 */
export class SoundRegistry {
  private static readonly MAP = new Map(
    RAW_SOUND_DATA.map((sound) => [sound.id, sound])
  );

  /**
   * Returns all raw sound data.
   */
  static getAll() {
    return RAW_SOUND_DATA;
  }

  /**
   * Retrieves a sound by its unique ID.
   * O(1) lookup.
   */
  static getById(id: string) {
    return this.MAP.get(id);
  }

  /**
   * Retrieves all sounds belonging to a specific category.
   */
  static getByCategory(category: string) {
    return RAW_SOUND_DATA.filter((sound) => sound.category === category);
  }
}
