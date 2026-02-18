import { ValueObject } from '../core/value-object';
import { VolumePhysics } from '../../core/audio/VolumePhysics';

/**
 * Properties for the Volume Value Object.
 */
interface VolumeProps {
  value: number;
}

/**
 * Volume Value Object representing a volume level between 0 and 100.
 * 
 * This object ensures that volume data is always valid and immutable.
 * It follows the Core Domain purity rules, being platform-agnostic.
 */
export class Volume extends ValueObject<VolumeProps> {
  public static readonly MIN = 0;
  public static readonly MAX = 100;

  /**
   * Private constructor to enforce the use of the static factory method.
   * @param props - The volume properties.
   */
  private constructor(props: VolumeProps) {
    super(props);
  }

  /**
   * Creates a new Volume instance, clamping the value between 0 and 100.
   * 
   * @param value - The volume level (0-100).
   * @returns A new Volume instance.
   */
  public static create(value: number): Volume {
    const clampedValue = Math.min(Math.max(value, this.MIN), this.MAX);
    return new Volume({ value: clampedValue });
  }

  /**
   * Gets the raw volume value (0-100).
   */
  get value(): number {
    return this.props.value;
  }

  /**
   * Converts the volume to a perceptual gain value (0.0-1.0) using the Fourth-Power Law.
   * Uses VolumePhysics for the calculation to maintain a single source of truth.
   * 
   * @returns The perceptual gain value.
   */
  public toLinear(): number {
    const normalized = VolumePhysics.toLinear(this.props.value);
    return VolumePhysics.toGain(normalized);
  }
}
