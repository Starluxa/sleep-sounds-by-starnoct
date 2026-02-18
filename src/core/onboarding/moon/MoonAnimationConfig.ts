/**
 * MoonAnimationConfig Policy: Core Animation Physics & Timing
 * 
 * Single Source of Truth for Moon animation parameters: durations, easing curves,
 * transform origins, filter effects. Defines the "feel" and physics as business policy.
 * 
 * Platform-agnostic: CSS-compatible strings for duration/easing; numeric primitives elsewhere.
 * Renderers (SVG/CSS, Canvas, Native) derive animation instructions from this policy.
 * 
 * ## Key Principles:
 * - **Business Policy**: Animation "feel" (pace, smoothness) centralized here
 * - **Consistent Cross-Platform**: Exact timing/physics on Web/Canvas/Native Canvas
 * - - **GPU Optimized**: transform-box='fill-box' ensures center-pivot rotation
 * - **Accessibility Aware**: Reduced-motion variants reference these baselines
 * - **Immutable Const**: `as const` enforces unidirectional data flow
 * - **Deletable Feature**: Remove without core business logic impact
 * 
 * ## Usage in Hexagonal Architecture:
 * ```
 * UseCase → emits MoonAnimationEvent → SVGPort.animate(MOON_ANIMATION_CONFIG)
 * CanvasPort.animate(MOON_ANIMATION_CONFIG)
 * ```
 * 
 * Changes here auto-propagate to all renderers.
 */

import type { 
  MoonAnimationParams, 
  DropShadowFilter,
  RockAnimationParams
} from './types.js';

export const MOON_ANIMATION_CONFIG: MoonAnimationParams = {
  bodyFilter: {
    offsetX: 0,
    offsetY: 0,
    blurRadius: 12,
    color: 'rgba(254, 243, 199, 0.7)'
  } as const,

  rock: {
    duration: '4s',
    easing: 'ease-in-out',
    transformBox: 'fill-box',
    iterations: 'infinite'
  } as const,

  faceOpacity: 0.85
} as const;
