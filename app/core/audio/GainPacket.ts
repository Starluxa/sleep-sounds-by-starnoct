/**
 * Data transfer object for gain changes with ramping support.
 */
export interface GainPacket {
  /**
   * The target gain level.
   * Expected range: 0.0 to 1.0.
   */
  targetGain: number;

  /**
   * The duration of the volume transition in milliseconds.
   */
  rampDurationMs: number;

  /**
   * Optional: The raw track volume (0-100) that resulted in this gain.
   * Used to keep the AudioPort's internal state in sync.
   */
  trackVolume?: number;
}
