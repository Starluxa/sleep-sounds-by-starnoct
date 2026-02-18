'use client';

import { useId } from 'react';

import { MOON_GEOMETRY } from '../../src/core/onboarding/moon/MoonGeometry';
import { getMoonColors, type CelestialTheme } from '../../src/core/onboarding/moon/MoonStyles';
import { MOON_ANIMATION_CONFIG } from '../../src/core/onboarding/moon/MoonAnimationConfig';
import type { MoonGeometry, MoonColors, MoonAnimationParams } from '../../src/core/onboarding/moon/types';

export interface MoonViewModel {
  readonly moonId: string;
  readonly gradientId: string;
  readonly geometry: MoonGeometry;
  readonly colors: MoonColors;
  readonly animationConfig: MoonAnimationParams;
}

interface UseMoonViewModelProps {
  readonly theme?: CelestialTheme;
}

export const useMoonViewModel = ({ theme = 'dark' }: UseMoonViewModelProps = {}): MoonViewModel => {
  const moonId = useId();
  const geometry = MOON_GEOMETRY;
  const colors = getMoonColors(theme);
  const gradientId = `${moonId}-body-gradient`;

  return {
    moonId,
    gradientId,
    geometry,
    colors,
    animationConfig: MOON_ANIMATION_CONFIG,
  };
};