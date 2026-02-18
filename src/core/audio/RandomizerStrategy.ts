import { ISoundEntity, SoundId, Volume } from './ISoundEntity';

/**
 * Represents a selected sound in a random mix.
 */
export interface IRandomSelection {
  readonly soundId: SoundId;
  readonly volume: Volume;
}

/**
 * Interface for randomizer strategies.
 */
export interface IRandomizerStrategy {
  /**
   * Generates a random mix of sounds from the available list.
   * @param availableSounds List of all sounds available to pick from.
   * @returns A list of selected sounds with their assigned volumes.
   */
  generateMix(availableSounds: ISoundEntity[]): IRandomSelection[];
}

/**
 * Provider for random numbers to ensure purity and testability.
 */
export type RandomProvider = () => number;

/**
 * Domain Strategy for generating random sound mixes.
 * Follows "Math-in, Math-out" principle by taking data as input and returning data.
 */
export class RandomizerStrategy implements IRandomizerStrategy {
  private readonly baseCategories = ['rain', 'ocean', 'color-noise', 'waterways'];
  private readonly accentCategories = ['forest', 'creatures', 'fire', 'thunder', 'ambient'];
  private readonly musicCategories = ['ambient', 'creatures'];

  constructor(private readonly random: RandomProvider = Math.random) {}

  /**
   * Generates a random mix based on category rules:
   * - 1 Base sound (60-75% volume)
   * - 1-2 Accent sounds (20-40% volume)
   * - Ensures at least one music element if possible
   */
  public generateMix(availableSounds: ISoundEntity[]): IRandomSelection[] {
    const mix: IRandomSelection[] = [];

    // 1. Select Base Sound
    const baseSounds = availableSounds.filter(s => this.baseCategories.includes(s.category));
    const shuffledBase = this.shuffle([...baseSounds]);
    
    if (shuffledBase.length > 0) {
      mix.push({
        soundId: shuffledBase[0].id,
        volume: this.random() * 15 + 60, // 60-75
      });
    }

    // 2. Select Accent Sounds
    const accentSounds = availableSounds.filter(s => this.accentCategories.includes(s.category));
    const shuffledAccent = this.shuffle([...accentSounds]);

    // Pick 1 or 2 accent sounds
    const numAccent = this.random() < 0.5 ? 1 : 2;
    const pickedAccents: ISoundEntity[] = [];
    
    for (let i = 0; i < numAccent && i < shuffledAccent.length; i++) {
      pickedAccents.push(shuffledAccent[i]);
    }

    // 3. Ensure Music Element
    const hasMusic = pickedAccents.some(s => this.musicCategories.includes(s.category));
    if (!hasMusic && pickedAccents.length > 0) {
      const musicSounds = accentSounds.filter(s => this.musicCategories.includes(s.category));
      if (musicSounds.length > 0) {
        const shuffledMusic = this.shuffle([...musicSounds]);
        // Replace the last accent with a music sound
        pickedAccents[pickedAccents.length - 1] = shuffledMusic[0];
      }
    }

    // 4. Add Accents to Mix
    for (const accent of pickedAccents) {
      mix.push({
        soundId: accent.id,
        volume: this.random() * 20 + 20, // 20-40
      });
    }

    return mix;
  }

  /**
   * Fisher-Yates shuffle using the provided random provider.
   */
  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
