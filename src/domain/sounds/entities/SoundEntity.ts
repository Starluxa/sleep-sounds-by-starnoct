import type { SoundState, SoundCategory, SoundBridgePacket } from '../dtos/SoundState';
import { LuxDomainError } from '../errors/LuxDomainError';
import { VolumePhysics } from '../../../core/audio/VolumePhysics';

/**
 * Transient Flyweight wrapper over {@link SoundState}.
 *
 * - Holds no derived or duplicated fields.
 * - Provides a thin “lens” for domain logic over immutable DTO data.
 * - Safe to create on-demand with minimal allocations.
 */
export class SoundEntity {
  constructor(private readonly props: SoundState) {
    this.validate();
  }

  /**
   * Static factory method to generate new SoundState objects.
   * This is the only allowed way to generate new sound objects in the app.
   * It merges defaults, validates the data, and returns the raw DTO.
   */
  static create(props: Partial<SoundState>): SoundState {
    const defaults: Partial<SoundState> = {
      volume: 75,
      category: 'other' as SoundCategory,
    };

    const merged = {
      ...defaults,
      ...props,
    } as SoundState;

    // Instantiate temporary wrapper to trigger validation
    const entity = new SoundEntity(merged);

    // Return the raw "Dumb Data" interface
    return entity.state;
  }

  /**
   * Returns the immutable underlying DTO (single source of truth).
   */
  get state(): SoundState {
    return this.props;
  }

  /**
   * Calculates the effective gain value using logarithmic volume physics.
   *
   * Converts the stored integer volume (0-100) to a perceptually-correct
   * gain value using the Square Law (x^2). This ensures proper
   * audio scaling that feels natural to human hearing.
   *
   * @returns The calculated gain value (0.0 to 1.0) based on x^2 curve.
   */
  getEffectiveGain(): number {
    const linearVolume = VolumePhysics.toLinear(this.props.volume);
    return VolumePhysics.toGain(linearVolume);
  }

  /**
   * Rigorously checks the injected SoundState against business rules.
   * Throws LuxDomainError if any rule is violated.
   */
  private validate(): void {
    const { id, volume, type, category } = this.props;

    // 1. ID must be non-empty alphanumeric with hyphens (kebab-case)
    if (!id || !/^[a-z0-9-]+$/i.test(id)) {
      throw new LuxDomainError(`Invalid Sound ID: "${id}". Must be non-empty alphanumeric with hyphens (kebab-case).`);
    }

    // 2. Volume must be clamped 0-100
    if (volume < 0 || volume > 100) {
      throw new LuxDomainError(`Invalid Volume: ${volume}. Must be between 0 and 100.`);
    }

    // 3. Category must be present
    if (!category) {
      throw new LuxDomainError(`Missing Category for sound: ${id}`);
    }

    // 4. Type-specific validation
    if (type === 'file') {
      if (!this.props.audioUrl) {
        throw new LuxDomainError(`Missing audioUrl for file-based sound: ${id}`);
      }
    } else if (type === 'synthetic') {
      if (!this.props.syntheticConfig) {
        throw new LuxDomainError(`Missing syntheticConfig for synthetic sound: ${id}`);
      }
    } else {
      throw new LuxDomainError(`Invalid or missing Sound Type: "${type}" for sound: ${id}`);
    }
  }

  /**
   * Converts the entity to a lean packet for the Native Bridge.
   * Strips UI metadata (categories, icons) to optimize JSON serialization.
   */
  toBridgePacket(): SoundBridgePacket {
    const { id, volume, type } = this.props;

    if (type === 'file') {
      return {
        id,
        volume,
        url: this.props.audioUrl,
      };
    }

    return {
      id,
      volume,
      syntheticConfig: this.props.syntheticConfig,
    };
  }
}

