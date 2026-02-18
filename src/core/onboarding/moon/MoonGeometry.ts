/**
 * MoonGeometry Policy: Core Single Source of Truth
 * 
 * This immutable data structure defines the exact visual geometry of the Moon entity
 * in the onboarding sequence. It serves as the canonical, platform-agnostic reference
 * for all renderers (SVG, Canvas, WebGL, Native Canvas).
 * 
 * ## Key Principles:
 * - **Single Source of Truth (SSOT)**: All moon visuals derive from this policy.
 * - **Deterministic Crescent**: Mathematically precise arc-based path ensures identical
 *   shape across all devices/resolutions without parameterization.
 * - **High-DPI Perfection**: Pure vector paths scale crisply to 4K/8K/Retina without
 *   aliasing or raster artifacts. No strokes, fills, or effects here—pure geometry.
 * - **Immutable & Const**: `as const` assertions enforce no mutations; derived state flows down.
 * - **Deletable Feature**: Remove this file; adapters fail gracefully via feature flags.
 * 
 * ## Usage in Hexagonal Architecture:
 * ```
 * UseCase → emits MoonVisualEvent → SVGPort.render(MOON_GEOMETRY)
 * CanvasPort.render(MOON_GEOMETRY)
 * ```
 * 
 * Changes here auto-propagate to all consumers without business logic rewrites.
 */

import type { 
  MoonGeometry, 
  PathData, 
  Transform 
} from './types.js';

export const MOON_GEOMETRY: MoonGeometry = {
  viewBox: [0, 0, 100, 100] as const,
  
  body: "M50,5 A45,45 0 1,1 50,95 A35,35 0 1,0 50,5 Z" as PathData,
  
  nightcap: {
    transform: "translate(50, 20)" as Transform,
    body: "M-22,-15 L-14,-38 L14,-38 L22,-15 Z" as PathData,
    fold: {
      cx: 0,
      cy: -38,
      rx: 18,
      ry: 6
    } as const,
    pompom: {
      cx: 16,
      cy: -40,
      r: 4.5
    } as const
  } as const,
  
  face: {
    opacity: 0.85,
    leftEye: "M34,38 Q39,40 44,38" as PathData,
    rightEye: "M56,38 Q61,40 66,38" as PathData,
    smile: "M38,52 Q50,58 62,52" as PathData
  } as const
} as const;
