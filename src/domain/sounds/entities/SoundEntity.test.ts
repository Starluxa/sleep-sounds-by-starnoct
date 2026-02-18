import { SoundEntity } from './SoundEntity';
import type { SoundState, FileSoundState, SyntheticSoundState } from '../dtos/SoundState';
import { LuxDomainError } from '../errors/LuxDomainError';

/**
 * Type guard to narrow SoundState to FileSoundState
 */
function isFileSound(state: SoundState): state is FileSoundState {
  return state.type === 'file';
}

/**
 * Type guard to narrow SoundState to SyntheticSoundState
 */
function isSyntheticSound(state: SoundState): state is SyntheticSoundState {
  return state.type === 'synthetic';
}

/**
 * Pure Domain Unit Verification Tests for SoundEntity
 *
 * These tests prove that the Hybrid DDD/DOD architecture is functioning as designed:
 * - Domain logic is centralized in the Entity
 * - Data is immutable and plain (Data-Oriented Design)
 * - Validation is fail-fast with domain-specific errors
 * - Bridge optimization strips UI metadata
 */
describe('SoundEntity', () => {
  describe('Creation Success', () => {
    it('should return a plain object from SoundFactory.create, not a class instance', () => {
      // Arrange: Define minimal valid properties for a file-based sound
      const fileSoundProps: Partial<FileSoundState> = {
        id: 'rain',
        type: 'file',
        audioUrl: '/sounds/rain.mp3',
        category: 'nature',
        volume: 75,
      };

      // Act: Create sound using the static factory method
      const result = SoundEntity.create(fileSoundProps);

      // Assert: Result should be a plain object, not a class instance
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).not.toBeInstanceOf(SoundEntity);
      expect(result).not.toBeInstanceOf(Function);

      // Verify it's a plain object with the expected structure
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);

      // Verify all expected properties are present using type guards
      expect(result.id).toBe('rain');
      expect(result.type).toBe('file');
      expect(result.category).toBe('nature');
      expect(result.volume).toBe(75);

      // Use type guard to access FileSoundState-specific property
      expect(isFileSound(result)).toBe(true);
      if (isFileSound(result)) {
        expect(result.audioUrl).toBe('/sounds/rain.mp3');
      }
    });

    it('should return a plain object for synthetic sounds as well', () => {
      // Arrange: Define minimal valid properties for a synthetic sound
      const synthSoundProps: Partial<SyntheticSoundState> = {
        id: 'brownNoise',
        type: 'synthetic',
        category: 'color-noise',
        volume: 50,
        syntheticConfig: { waveform: 'brown', frequency: 100 },
      };

      // Act: Create synthetic sound using the static factory method
      const result = SoundEntity.create(synthSoundProps);

      // Assert: Result should be a plain object
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).not.toBeInstanceOf(SoundEntity);
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);

      // Verify synthetic-specific properties
      expect(result.id).toBe('brownNoise');
      expect(result.type).toBe('synthetic');

      // Use type guard to access SyntheticSoundState-specific property
      expect(isSyntheticSound(result)).toBe(true);
      if (isSyntheticSound(result)) {
        expect(result.syntheticConfig).toEqual({ waveform: 'brown', frequency: 100 });
      }
    });
  });

  describe('Validation Failure', () => {
    it('should throw LuxDomainError when creating a sound with volume 150 (exceeds max 100)', () => {
      // Arrange: Define properties with invalid volume (150 > 100)
      const invalidSoundProps: Partial<FileSoundState> = {
        id: 'thunder',
        type: 'file',
        audioUrl: '/sounds/thunder.mp3',
        category: 'nature',
        volume: 150, // Invalid: exceeds maximum of 100
      };

      // Act & Assert: Creating sound with volume 150 should throw LuxDomainError
      expect(() => {
        SoundEntity.create(invalidSoundProps);
      }).toThrow(LuxDomainError);

      expect(() => {
        SoundEntity.create(invalidSoundProps);
      }).toThrow(/Invalid Volume: 150\. Must be between 0 and 100/);
    });

    it('should throw LuxDomainError when creating a sound with negative volume', () => {
      // Arrange: Define properties with negative volume
      const invalidSoundProps: Partial<FileSoundState> = {
        id: 'wind',
        type: 'file',
        audioUrl: '/sounds/wind.mp3',
        category: 'nature',
        volume: -10, // Invalid: negative volume
      };

      // Act & Assert: Creating sound with negative volume should throw LuxDomainError
      expect(() => {
        SoundEntity.create(invalidSoundProps);
      }).toThrow(LuxDomainError);

      expect(() => {
        SoundEntity.create(invalidSoundProps);
      }).toThrow(/Invalid Volume: -10\. Must be between 0 and 100/);
    });

    it('should throw LuxDomainError for volume at exact boundary 101', () => {
      // Arrange: Define properties with volume just over the boundary
      const invalidSoundProps: Partial<FileSoundState> = {
        id: 'ocean',
        type: 'file',
        audioUrl: '/sounds/ocean.mp3',
        category: 'ocean',
        volume: 101, // Invalid: just over maximum
      };

      // Act & Assert
      expect(() => {
        SoundEntity.create(invalidSoundProps);
      }).toThrow(LuxDomainError);
    });

    it('should accept volume at exact boundary 100 without throwing', () => {
      // Arrange: Define properties with volume at exact maximum boundary
      const validSoundProps: Partial<FileSoundState> = {
        id: 'fire',
        type: 'file',
        audioUrl: '/sounds/fire.mp3',
        category: 'fire',
        volume: 100, // Valid: exactly at maximum
      };

      // Act & Assert: Should not throw
      expect(() => {
        SoundEntity.create(validSoundProps);
      }).not.toThrow();

      const result = SoundEntity.create(validSoundProps);
      expect(result.volume).toBe(100);
    });
  });

  describe('Bridge Optimization', () => {
    it('should remove the category property in toBridgePacket for file sounds', () => {
      // Arrange: Create a sound state with all metadata
      const fileSoundState: FileSoundState = {
        id: 'forest',
        type: 'file',
        audioUrl: '/sounds/forest.mp3',
        category: 'forest',
        volume: 80,
      };

      // Create entity wrapper (this would normally be done internally)
      const entity = new SoundEntity(fileSoundState);

      // Act: Convert to bridge packet
      const bridgePacket = entity.toBridgePacket();

      // Assert: Bridge packet should only contain essential bridge properties
      expect(bridgePacket).toHaveProperty('id', 'forest');
      expect(bridgePacket).toHaveProperty('volume', 80);
      expect(bridgePacket).toHaveProperty('url', '/sounds/forest.mp3');

      // Verify category (UI metadata) is NOT in the bridge packet
      expect(bridgePacket).not.toHaveProperty('category');

      // Verify the object is lean
      expect(Object.keys(bridgePacket)).toHaveLength(3);
    });

    it('should remove the category property in toBridgePacket for synthetic sounds', () => {
      // Arrange: Create a synthetic sound state
      const synthSoundState: SyntheticSoundState = {
        id: 'pinkNoise',
        type: 'synthetic',
        category: 'color-noise',
        volume: 65,
        syntheticConfig: { waveform: 'pink', amplitude: 0.5 },
      };

      // Create entity wrapper
      const entity = new SoundEntity(synthSoundState);

      // Act: Convert to bridge packet
      const bridgePacket = entity.toBridgePacket();

      // Assert: Bridge packet should only contain essential bridge properties
      expect(bridgePacket).toHaveProperty('id', 'pinkNoise');
      expect(bridgePacket).toHaveProperty('volume', 65);
      expect(bridgePacket).toHaveProperty('syntheticConfig');
      expect(bridgePacket.syntheticConfig).toEqual({ waveform: 'pink', amplitude: 0.5 });

      // Verify category (UI metadata) is NOT in the bridge packet
      expect(bridgePacket).not.toHaveProperty('category');
      expect(bridgePacket).not.toHaveProperty('type');

      // Verify the object is lean
      expect(Object.keys(bridgePacket)).toHaveLength(3);
    });

    it('should return a plain object from toBridgePacket with no prototype pollution', () => {
      // Arrange
      const fileSoundState: FileSoundState = {
        id: 'stream',
        type: 'file',
        audioUrl: '/sounds/stream.mp3',
        category: 'waterways',
        volume: 45,
      };

      const entity = new SoundEntity(fileSoundState);

      // Act
      const bridgePacket = entity.toBridgePacket();

      // Assert: Bridge packet should be a plain object
      expect(Object.getPrototypeOf(bridgePacket)).toBe(Object.prototype);
      expect(typeof bridgePacket).toBe('object');
    });
  });

  describe('Hybrid DDD/DOD Architecture Verification', () => {
    it('should maintain immutability of the underlying state', () => {
      // Arrange
      const soundState: FileSoundState = {
        id: 'crickets',
        type: 'file',
        audioUrl: '/sounds/crickets.mp3',
        category: 'creatures',
        volume: 30,
      };

      const entity = new SoundEntity(soundState);

      // Act
      const state1 = entity.state;
      const state2 = entity.state;

      // Assert: State should be immutable (same reference returned)
      expect(state1).toBe(state2);
      expect(state1).toBe(soundState);
    });

    it('should calculate effective gain using VolumePhysics', () => {
      // Arrange
      const soundState: FileSoundState = {
        id: 'nightAmbience',
        type: 'file',
        audioUrl: '/sounds/night.mp3',
        category: 'ambient',
        volume: 50, // 50% volume
      };

      const entity = new SoundEntity(soundState);

      // Act
      const gain = entity.getEffectiveGain();

      // Assert: 50% volume = 0.5 linear = 0.5^4 = 0.0625 gain
      expect(gain).toBeCloseTo(0.0625, 4);
    });

    it('should apply defaults when creating with partial props', () => {
      // Arrange: Minimal required properties
      const minimalProps: Partial<FileSoundState> = {
        id: 'minimal',
        type: 'file',
        audioUrl: '/sounds/minimal.mp3',
      };

      // Act
      const result = SoundEntity.create(minimalProps);

      // Assert: Defaults should be applied
      expect(result.volume).toBe(75); // Default volume
      expect(result.category).toBe('other'); // Default category
    });
  });
});
