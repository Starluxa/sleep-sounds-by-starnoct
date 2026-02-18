/**
 * HeadroomCalculator provides logic to prevent digital clipping when multiple sounds play simultaneously.
 * It calculates a gain scalar based on the number of active tracks.
 */
export class HeadroomCalculator {
  /**
   * Calculates the gain scalar for each track to ensure the sum doesn't exceed 1.0 (0dB).
   * Uses the formula: 1 / sqrt(activeTrackCount)
   * 
   * @param activeTrackCount The number of tracks currently playing.
   * @returns A gain scalar between 0.0 and 1.0.
   */
  static calculateGainScalar(activeTrackCount: number): number {
    if (activeTrackCount <= 0) {
      return 1.0;
    }

    // Formula: 1 / sqrt(N)
    // This is a common heuristic for summing uncorrelated signals.
    const scalar = 1 / Math.sqrt(activeTrackCount);

    // Safety checks for Infinity or NaN
    if (!isFinite(scalar) || isNaN(scalar)) {
      return 1.0;
    }

    // Ensure we don't exceed 1.0
    return Math.min(scalar, 1.0);
  }
}
