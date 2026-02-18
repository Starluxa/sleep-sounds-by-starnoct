import { Star } from './types';
import { 
  STAR_SIZES, 
  ANIMATION_TIMINGS, 
  STAR_DISTRIBUTION, 
  STAR_APPEARANCE, 
  PROMINENT_POSITIONS 
} from './constants';
import {
  seededRandom,
  getStarCount,
  getAnimationTime
} from './math';

/**
 * StarFactory Domain Service
 * Responsible for generating the star field layout.
 * Pure and platform-agnostic.
 */
export class StarFactory {
  /**
   * Creates a field of stars based on the provided dimensions.
   * @param width Canvas width
   * @param height Canvas height
   * @returns Array of Star objects
   */
  static createStarField(width: number, height: number): Star[] {
    const stars: Star[] = [];
    const totalStars = getStarCount(width);
    const seed = Math.floor(width) * 1000 + Math.floor(height);
    const rng = seededRandom(seed);

    const mediumStars = Math.floor(totalStars * STAR_DISTRIBUTION.MEDIUM_PERCENT);
    const largeStars = STAR_DISTRIBUTION.LARGE_COUNT;

    const sizes: number[] = [
      ...Array(largeStars).fill(STAR_SIZES.LARGE),
      ...Array(mediumStars).fill(STAR_SIZES.MEDIUM),
      ...Array(totalStars - largeStars - mediumStars).fill(STAR_SIZES.SMALL),
    ];

    // Shuffle sizes (Fisher-Yates)
    for (let i = sizes.length - 1; i > 3; i--) {
      const j = Math.floor(rng() * (i - 2)) + 3;
      [sizes[i], sizes[j]] = [sizes[j], sizes[i]];
    }

    const cols = Math.ceil(Math.sqrt(totalStars));
    const rows = Math.ceil(totalStars / cols);
    const cellW = width / cols;
    const cellH = height / rows;

    let starIndex = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (starIndex >= totalStars) break;

        let x: number, y: number;

        if (starIndex < largeStars && sizes[starIndex] === STAR_SIZES.LARGE) {
          const pos = PROMINENT_POSITIONS[starIndex];
          x = width * pos.x;
          y = height * pos.y;
        } else {
          const jitterX = (rng() - 0.5) * cellW * 0.8;
          const jitterY = (rng() - 0.5) * cellH * 0.8;
          x = c * cellW + cellW / 2 + jitterX;
          y = r * cellH + cellH / 2 + jitterY;
        }

        const baseAnimTime = getAnimationTime(sizes[starIndex]);
        const cycleDuration = baseAnimTime + ANIMATION_TIMINGS.DWELL_DURATION;

        stars.push({
          x,
          y,
          radius: sizes[starIndex],
          opacity: STAR_APPEARANCE.MAX_OPACITY,
          cycleProgress: starIndex / totalStars,
          cycleDuration,
        });
        starIndex++;
      }
    }

    return stars;
  }
}
