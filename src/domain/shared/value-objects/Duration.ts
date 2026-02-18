import { ValueObject } from '../../core/value-object';

interface DurationProps {
  readonly targetTimestamp: number;
  readonly durationSeconds?: number;
}

/**
 * Duration Value Object representing a point in time when a timer should expire.
 * Implements the "Target-Anchor" pattern where the internal state is the target timestamp.
 *
 * For deterministic math, pass explicit anchor timestamps to the factory/methods.
 */
export class Duration extends ValueObject<DurationProps> {
  public static readonly MAX_SECONDS = 6 * 60 * 60;

  private constructor(props: DurationProps) {
    super(props);
  }

  public static isValid(props: DurationProps): boolean {
    return (
      typeof props.targetTimestamp === 'number' &&
      Number.isFinite(props.targetTimestamp) &&
      props.targetTimestamp >= 0
    );
  }

  private static clampSeconds(seconds: number): number {
    if (!Number.isFinite(seconds)) {
      return 0;
    }
    return Math.min(Math.max(seconds, 0), Duration.MAX_SECONDS);
  }

  private static resolveTargetTimestamp(anchorTimestamp: number, durationSeconds: number): number {
    return anchorTimestamp + durationSeconds * 1000;
  }

  /**
   * Creates a Duration from minutes starting from the provided anchor.
   * @param minutes Number of minutes
   * @param anchorTimestamp Timestamp in milliseconds to anchor the duration (defaults to now)
   */
  public static fromMinutes(minutes: number, anchorTimestamp: number = Date.now()): Duration {
    return Duration.fromSeconds(minutes * 60, anchorTimestamp);
  }

  /**
   * Creates a Duration from seconds starting from the provided anchor.
   * Clamps between 0 and MAX_SECONDS.
   * @param seconds Number of seconds
   * @param anchorTimestamp Timestamp in milliseconds to anchor the duration (defaults to now)
   */
  public static fromSeconds(seconds: number, anchorTimestamp: number = Date.now()): Duration {
    const clampedSeconds = Duration.clampSeconds(seconds);
    const targetTimestamp = Duration.resolveTargetTimestamp(anchorTimestamp, clampedSeconds);
    return new Duration({ targetTimestamp, durationSeconds: clampedSeconds });
  }

  /**
   * Creates a Duration from seconds starting from now.
   * @param seconds Number of seconds
   */
  public static fromNow(seconds: number): Duration {
    return Duration.fromSeconds(seconds, Date.now());
  }

  /**
   * Creates a Duration from a specific target timestamp.
   * @param targetTimestamp The timestamp in milliseconds when the timer should expire.
   * @param anchorTimestamp Optional anchor timestamp to derive remaining seconds.
   */
  public static fromTargetTimestamp(targetTimestamp: number, anchorTimestamp?: number): Duration {
    if (!Number.isFinite(targetTimestamp) || targetTimestamp < 0) {
      throw new Error('Target timestamp cannot be negative');
    }

    const durationSeconds =
      typeof anchorTimestamp === 'number'
        ? Duration.getRemainingSecondsFrom(targetTimestamp, anchorTimestamp)
        : undefined;

    return new Duration({ targetTimestamp, durationSeconds });
  }

  /**
   * Pure calculation: derives remaining seconds from a target timestamp and anchor.
   */
  public static getRemainingSecondsFrom(targetTimestamp: number, anchorTimestamp: number): number {
    if (!Number.isFinite(targetTimestamp) || !Number.isFinite(anchorTimestamp)) {
      return 0;
    }
    return Math.max(0, (targetTimestamp - anchorTimestamp) / 1000);
  }

  /**
   * Pure calculation: derives target timestamp from an anchor and relative duration.
   */
  public static getTargetTimestampFrom(anchorTimestamp: number, durationSeconds: number): number {
    const clampedSeconds = Duration.clampSeconds(durationSeconds);
    return Duration.resolveTargetTimestamp(anchorTimestamp, clampedSeconds);
  }

  /**
   * Calculates the remaining seconds until the target timestamp (rounded down).
   * Returns 0 if the target timestamp has passed.
   */
  public get remainingSeconds(): number {
    return Math.floor(this.getRemainingSeconds());
  }

  /**
   * Calculates the remaining seconds until the target timestamp.
   * Pass an anchor for deterministic math.
   */
  public getRemainingSeconds(anchorTimestamp: number = Date.now()): number {
    return Duration.getRemainingSecondsFrom(this.props.targetTimestamp, anchorTimestamp);
  }

  /**
   * Returns the stored duration seconds if available, otherwise derives from the anchor.
   */
  public toSeconds(anchorTimestamp: number = Date.now()): number {
    if (typeof this.props.durationSeconds === 'number') {
      return this.props.durationSeconds;
    }
    return this.getRemainingSeconds(anchorTimestamp);
  }

  /**
   * Returns the target timestamp in milliseconds.
   */
  public get targetTimestamp(): number {
    return this.props.targetTimestamp;
  }

  /**
   * Returns the target timestamp in milliseconds.
   */
  public getTargetTimestamp(): number {
    return this.props.targetTimestamp;
  }

  /**
   * Checks if the duration has expired.
   */
  public get isExpired(): boolean {
    return this.isExpiredAt(Date.now());
  }

  /**
   * Checks if the duration has expired at the provided anchor.
   */
  public isExpiredAt(anchorTimestamp: number): boolean {
    return this.props.targetTimestamp <= anchorTimestamp;
  }

  public toJSON(): { targetTimestamp: number } {
    return { targetTimestamp: this.props.targetTimestamp };
  }

  public static fromJSON(json: { targetTimestamp: number }): Duration {
    return Duration.fromTargetTimestamp(json.targetTimestamp);
  }
}
