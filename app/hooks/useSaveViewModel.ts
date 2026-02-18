import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { SaveMixAnimationPolicy } from '../core/onboarding/save-animation/SaveMixAnimationPolicy';

export interface SaveViewModelReturn {
  readonly uniqueId: string;
  readonly reducedMotion: boolean;
  readonly policy: SaveMixAnimationPolicy;
  readonly startAnimation: () => void;
  readonly stopAnimation: () => void;
}

export function useSaveViewModel(): SaveViewModelReturn {
  const id = useId().replace(/:/g, '');
  const uniqueId = `save-mix-${id}`;

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // SSR safe: only run client-side
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    // No listener needed: detect once on mount as per spec
  }, []);

  const policy = useMemo(
    () => new SaveMixAnimationPolicy(reducedMotion),
    [reducedMotion]
  );

  const startAnimation = useCallback(() => {
    // Placeholder: Future integration with SaveAnimationOrchestrator.start()
    // Emits domain event or calls injected orchestrator
  }, []);

  const stopAnimation = useCallback(() => {
    // Placeholder: Future integration with SaveAnimationOrchestrator.stop()
  }, []);

  return useMemo(
    () => ({
      uniqueId,
      reducedMotion,
      policy,
      startAnimation,
      stopAnimation,
    }),
    [uniqueId, reducedMotion, policy, startAnimation, stopAnimation]
  );
}