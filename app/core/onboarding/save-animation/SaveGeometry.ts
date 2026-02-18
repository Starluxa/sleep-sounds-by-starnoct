/**
 * SaveGeometry Policy: Core Single Source of Truth
 * 
 * This immutable data structure defines the exact visual geometry of the Save/Heart entity
 * in the onboarding sequence. It serves as the canonical, platform-agnostic reference
 * for all renderers (SVG, Canvas, WebGL, Native Canvas).
 * 
 * ## Key Principles:
 * - **Single Source of Truth (SSOT)**: All save visuals derive from this policy.
 * - **Deterministic Paths**: Exact SVG paths ensure identical shape across devices.
 * - **Normalized Positions**: Sparkle {x,y} in 0-1 range relative to container (128x128px basis).
 * - **High-DPI Vector**: Pure paths scale perfectly without rasterization.
 * - **Immutable Const**: `as const` prevents mutations; state flows unidirectionally.
 * - **Deletable**: Remove this; adapters degrade gracefully.
 * 
 * ## Coordinates Basis:
 * - Container: 128x128px (w-32 h-32 Tailwind)
 * - Heart: centered, base 64px scale (0.5 normalized)
 * - Sparkles: centers calculated from absolute Tailwind positions
 *   - Top-right: center (122px, 6px) → {x: 0.953, y: 0.047}, baseSize: 0.094 (12px)
 *   - Bottom-left: center (12px, 116px) → {x: 0.094, y: 0.906}, baseSize: 0.063 (8px)
 *   - Top-left: center (5px, 21px) → {x: 0.039, y: 0.164}, baseSize: 0.078 (10px)
 * - Rings: radius normalized (outer: 0.375, middle: 0.313)
 * 
 * ## Usage:
 * ```
 * Policy.computeFrame(t) → State → Renderer.render(SAVE_GEOMETRY, State)
 * ```
 */

import type { SparkleState } from './types';

export interface SaveSparkleGeometry {
  readonly position: readonly [number, number]; // normalized x,y 0-1
  readonly baseScale: number; // normalized base size 0-1
}

export interface SaveGeometry {
  readonly containerViewBox: readonly [number, number, number, number];
  readonly heart: {
    readonly viewBox: readonly [number, number, number, number];
    readonly pathD: `M${string}`;
    readonly baseScale: number;
  };
  readonly sparkle: {
    readonly viewBox: readonly [number, number, number, number];
    readonly pathD: `M${string}`;
  };
  readonly sparkles: readonly SaveSparkleGeometry[];
  readonly ringRadii: {
    readonly outer: number;
    readonly middle: number;
  };
}

export const SAVE_GEOMETRY: SaveGeometry = {
  containerViewBox: [0, 0, 128, 128] as const,
  
  heart: {
    viewBox: [0, 0, 24, 24] as const,
    pathD: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' as const,
    baseScale: 64 / 128, // 0.5
  },
  
  sparkle: {
    viewBox: [0, 0, 20, 20] as const,
    pathD: 'M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z' as const,
  },
  
  sparkles: [
    // Top-right
    { position: [122 / 128, 6 / 128] as const, baseScale: 12 / 128 },
    // Bottom-left
    { position: [12 / 128, 116 / 128] as const, baseScale: 8 / 128 },
    // Top-left
    { position: [5 / 128, 21 / 128] as const, baseScale: 10 / 128 },
  ] as const,
  
  ringRadii: {
    outer: 48 / 128, // w-24 h-24 / 2
    middle: 40 / 128, // w-20 h-20 / 2
  } as const,
} as const;
