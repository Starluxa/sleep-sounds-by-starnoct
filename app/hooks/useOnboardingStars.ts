import { useMemo } from 'react';
import { Star } from '../../src/core/onboarding/types';
import { StableSeedProvider } from '../../src/infrastructure/onboarding/StableSeedProvider';
import { StarLayoutEngine, Density } from '../../src/core/onboarding/StarLayoutEngine';

export function useOnboardingStars(density: Density = 'low'): Star[] {
  const seedProvider = new StableSeedProvider();
  const seed = seedProvider.getSeed();
  const layoutEngine = new StarLayoutEngine();

  const stars = useMemo(() => {
    return layoutEngine.generateStars(seed, density);
  }, [seed, density]);

  return stars;
}