/**
 * ISoundRegistry defines the contract for mapping sound IDs to asset paths.
 * This ensures the core domain and infrastructure have a unified way to resolve sounds.
 */
export interface ISoundRegistry {
  /**
   * Resolves a sound ID to its asset URL or path.
   * @param soundId The unique identifier for the sound.
   * @returns The URL or path to the sound asset.
   */
  resolveUrl(soundId: string): string;

  /**
   * Checks if a sound is synthetic (e.g., white noise generated via code).
   * @param soundId The unique identifier for the sound.
   * @returns True if the sound is synthetic, false otherwise.
   */
  isSynthetic(soundId: string): boolean;
}
