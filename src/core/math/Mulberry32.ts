/**
 * Mulberry32 Deterministic Pseudo-Random Number Generator
 *
 * Implements the Mulberry32 algorithm for generating deterministic random numbers
 * from a seed. This ensures identical sequences on server and client for UI consistency.
 *
 * Algorithm: a = (a + 0x6D2B79F5) | 0; return ((a ^ (a >>> 15)) >>> 0) / 4294967296;
 */
export class Mulberry32 {
  private a: number;

  /**
   * Creates a new Mulberry32 PRNG instance with the given seed.
   * @param seed - The 32-bit integer seed for deterministic generation
   */
  constructor(seed: number) {
    this.a = seed | 0; // Ensure 32-bit integer
  }

  /**
   * Generates the next random number in the sequence (0 <= n < 1).
   * @returns A number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    this.a = (this.a + 0x6D2B79F5) | 0;
    let t = Math.imul(this.a ^ (this.a >>> 15), 1 | this.a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) | 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a random float within the specified range.
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (exclusive)
   * @returns A random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates a random integer within the specified range.
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random integer between min and max
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}