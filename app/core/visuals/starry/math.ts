import { 
  STAR_SIZES, 
  ANIMATION_TIMINGS, 
  STAR_APPEARANCE 
} from './constants';

/**
 * Creates a deterministic pseudo-random number generator based on a seed.
 */
export const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

/**
 * Determines the number of stars to render based on the canvas width.
 */
export const getStarCount = (width: number): number => {
  if (width >= 1920) return 44;
  if (width >= 1366) return 36;
  if (width >= 1024) return 30;
  if (width >= 768) return 24;
  return 18;
};

/**
 * Returns the base animation timing for a star based on its size.
 */
export const getAnimationTime = (size: number): number => {
  if (size === STAR_SIZES.SMALL) return ANIMATION_TIMINGS.SMALL_BASE;
  if (size === STAR_SIZES.MEDIUM) return ANIMATION_TIMINGS.MEDIUM_BASE;
  return ANIMATION_TIMINGS.LARGE_BASE;
};

/**
 * Calculates the opacity of a star based on its current cycle progress.
 * Animation cycle: fade out → dwell at 0 → fade in
 */
export const calculateStarOpacity = (cycleProgress: number, cycleDuration: number): number => {
  const dwellDuration = ANIMATION_TIMINGS.DWELL_DURATION;
  const animTime = cycleDuration - dwellDuration;
  const fadeOutEnd = (animTime / 2) / cycleDuration;
  const dwellEnd = fadeOutEnd + (dwellDuration / cycleDuration);

  if (cycleProgress < fadeOutEnd) {
    const fadeProgress = cycleProgress / fadeOutEnd;
    return STAR_APPEARANCE.MAX_OPACITY * Math.cos(fadeProgress * Math.PI / 2);
  } else if (cycleProgress < dwellEnd) {
    return 0;
  } else {
    const fadeProgress = (cycleProgress - dwellEnd) / (1 - dwellEnd);
    return STAR_APPEARANCE.MAX_OPACITY * Math.sin(fadeProgress * Math.PI / 2);
  }
};
