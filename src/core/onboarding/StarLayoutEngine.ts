/**
 * StarLayoutEngine Domain Service
 *
 * Generates a deterministic array of stars for onboarding UI using
 * Mulberry32 PRNG and density policies. This service encapsulates
 * the procedural generation logic as pure domain logic.
 */

import { Star } from './types';
import { Mulberry32 } from '../math/Mulberry32';
import { LOW_DENSITY_STARS, MEDIUM_DENSITY_STARS, HIGH_DENSITY_STARS } from './StarConstants';

/**
 * Interface for random number generation to wrap third-party PRNG logic.
 */
interface IRandomNumberGenerator {
  next(): number;
  nextFloat(min: number, max: number): number;
  nextInt(min: number, max: number): number;
}

/**
 * Density levels for star generation.
 */
export type Density = 'low' | 'medium' | 'high';

/**
 * Internal constants for star generation.
 */
const STAR_SIZES = {
  LARGE: 4.5,
  SMALL: 1.5,
} as const;

const SIZE_DISTRIBUTION = {
  LARGE_PERCENTAGE: 0.3, // 30% large stars
} as const;

const STAR_OPACITY = {
  MIN: 0.4,
  MAX: 1.0,
} as const;

const ANIMATION_TIMINGS = {
  BASE_DURATION: 3000, // 3 seconds
  MAX_DELAY: 1000, // up to 1 second variation
} as const;

/**
 * Gets the number of stars for the given density.
 */
function getStarCountForDensity(density: Density): number {
  switch (density) {
    case 'low':
      return LOW_DENSITY_STARS;
    case 'medium':
      return MEDIUM_DENSITY_STARS;
    case 'high':
      return HIGH_DENSITY_STARS;
  }
}

/**
 * StarLayoutEngine Domain Service
 *
 * Pure service that generates deterministic star layouts for onboarding.
 * No dependencies on UI frameworks or external state.
 */
export class StarLayoutEngine {
  /**
   * Generates a deterministic array of stars for the given seed and density.
   *
   * @param seed - The seed for deterministic generation
   * @param density - The density level for star count
   * @returns Array of Star objects with deterministic positions and properties
   */
  public generateStars(seed: number, density: Density): Star[] {
    const rng: IRandomNumberGenerator = new Mulberry32(seed);
    const starCount = getStarCountForDensity(density);
    const stars: Star[] = [];

    const largeStarCount = Math.floor(starCount * SIZE_DISTRIBUTION.LARGE_PERCENTAGE);

    for (let i = 0; i < starCount; i++) {
      // Position: random x,y in 0-1
      const x = rng.next();
      const y = rng.next();

      // Size: large or small based on distribution
      const isLarge = rng.next() < SIZE_DISTRIBUTION.LARGE_PERCENTAGE;
      const size = isLarge ? STAR_SIZES.LARGE : STAR_SIZES.SMALL;

      // Opacity: random between min and max
      const opacity = rng.nextFloat(STAR_OPACITY.MIN, STAR_OPACITY.MAX);

      // Animation: stagger cycle progress, fixed duration with some variation
      const cycleProgress = rng.next(); // Random start progress
      const durationVariation = rng.nextFloat(0, ANIMATION_TIMINGS.MAX_DELAY);
      const cycleDuration = ANIMATION_TIMINGS.BASE_DURATION + durationVariation;

      stars.push({
        x,
        y,
        size,
        opacity,
        cycleProgress,
        cycleDuration,
      });
    }

    return stars;
  }
}