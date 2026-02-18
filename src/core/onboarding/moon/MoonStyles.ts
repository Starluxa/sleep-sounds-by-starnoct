/**
 * MoonStyles Policy: Centralized Celestial Visual Styles
 * 
 * Single Source of Truth for all Moon color palettes and theme-aware color resolution.
 * Pure domain logic: Platform-agnostic color definitions for SVG, Canvas, WebGL renderers.
 * 
 * ## Theme-Awareness:
 * - `dark`: Warm golden crescent moon with violet nightcap (primary sleep app theme)
 * - `light`: Cooler silver-blue moon with pastel accents (accessibility/future support)
 * 
 * ## Principles:
 * - Immutable const assertions
 * - Semantic color roles (no magic hex values)
 * - Scalable: Add themes without core changes
 * - Deletable: Feature toggle isolates visuals
 * 
 * Usage:
 * ```
 * const colors = getMoonColors('dark');
 * SVGRenderer.render(MOON_GEOMETRY, colors);
 * ```
 */

import type { 
  MoonColors 
} from './types.js';

export type CelestialTheme = 'dark' | 'light';

export const DARK_MOON_COLORS: MoonColors = {
  bodyGradient: [
    { offset: '0%',   color: '#FEF3C7' },
    { offset: '30%',  color: '#FCD34D' },
    { offset: '70%',  color: '#F59E0B' },
    { offset: '100%', color: '#D97706' },
  ] as const,
  nightcap: {
    body: {
      fill: '#C4B5FD',
      stroke: '#A78BFA',
      strokeWidth: 1,
    },
    fold: {
      fill: '#A78BFA',
    },
    pompom: {
      fill: '#EDE9FE',
    },
  },
  face: {
    stroke: '#FCD34D',
    strokeWidthEyes: 2.5,
    strokeWidthSmile: 2,
  },
} as const;

export const LIGHT_MOON_COLORS: MoonColors = {
  bodyGradient: [
    { offset: '0%',   color: '#F0F9FF' },
    { offset: '50%',  color: '#E0F2FE' },
    { offset: '100%', color: '#0EA5E9' },
  ] as const,
  nightcap: {
    body: {
      fill: '#C4B5FD',
      stroke: '#A78BFA',
      strokeWidth: 0.5,
    },
    fold: {
      fill: '#A78BFA',
    },
    pompom: {
      fill: '#EDE9FE',
    },
  },
  face: {
    stroke: '#475569',
    strokeWidthEyes: 2,
    strokeWidthSmile: 1.5,
  },
} as const;

/**
 * Theme-aware color palette resolver.
 * Defaults to 'dark' for primary celestial/nighttime experience.
 */
export const getMoonColors = (theme: CelestialTheme = 'dark'): MoonColors => 
  theme === 'light' ? LIGHT_MOON_COLORS : DARK_MOON_COLORS;
