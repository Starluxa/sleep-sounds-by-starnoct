/**
 * VolumePhysics provides the "Universal Source of Truth" for volume-related calculations.
 * 
 * This class is part of the Core Domain and is strictly platform-agnostic,
 * containing no UI, Framework, or Native dependencies.
 */
export class VolumePhysics {
  /**
   * Converts a percentage-based volume value (0-100) to a linear gain value (0.0-1.0).
   * 
   * @param value - The volume level as a percentage (0 to 100).
   * @returns The linear gain value (0.0 to 1.0).
   * 
   * @example
   * VolumePhysics.toLinear(50); // returns 0.5
   */
  static toLinear(value: number): number {
    return value / 100;
  }

  /**
   * Applies the Square Law (Gain = x^2) to a normalized volume value.
   *
   * The Square Law provides a natural perceptual volume curve for digital audio,
   * offering better resolution at lower volume levels. This is the standard
   * for all gain calculations in the app to ensure consistent perceptual volume.
   *
   * @param normalizedValue - A value between 0.0 and 1.0 representing the volume level.
   * @returns The calculated amplitude scalar (gain) based on the x^2 curve.
   *
   * @example
   * VolumePhysics.toGain(0.5); // returns 0.25 (0.5^2)
   */
  static toGain(normalizedValue: number): number {
    // Ensure the value is clamped between 0 and 1 to prevent unexpected gain values
    const x = Math.max(0, Math.min(1, normalizedValue));
    return x * x;
  }
}
