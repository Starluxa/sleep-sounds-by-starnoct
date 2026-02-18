export const STAR_SIZES = {
  SMALL: 25,
  MEDIUM: 37.5,
  LARGE: 70,
} as const;

export const ANIMATION_TIMINGS = {
  SMALL_BASE: 5000,
  MEDIUM_BASE: 6667,
  LARGE_BASE: 10000,
  DWELL_DURATION: 7000,
  FPS_TARGET: 33,
} as const;

export const STAR_DISTRIBUTION = {
  SMALL_PERCENT: 0.6,
  MEDIUM_PERCENT: 0.2,
  LARGE_COUNT: 3,
} as const;

export const STAR_APPEARANCE = {
  MAX_OPACITY: 0.9,
  COLOR: 'hsla(190, 95%, 90%, ',
  GLOW_BLUR: 8,
  GLOW_INTENSITY: 0.8,
} as const;

export const GRADIENT_COLORS = {
  LINEAR: [
    { stop: 0, color: "hsl(230, 35%, 7%)" },
    { stop: 0.5, color: "hsl(240, 40%, 10%)" },
    { stop: 1, color: "hsl(250, 40%, 12%)" },
  ],
  RADIAL: [
    { stop: 0, color: "hsla(265, 80%, 65%, 0.20)" },
    { stop: 0.3, color: "hsla(250, 75%, 55%, 0.15)" },
    { stop: 0.6, color: "hsla(235, 60%, 40%, 0.10)" },
    { stop: 1, color: "hsla(230, 35%, 7%, 0)" },
  ],
} as const;

export const PROMINENT_POSITIONS = [
  { x: 0.2, y: 0.25 },
  { x: 0.8, y: 0.65 },
  { x: 0.5, y: 0.45 },
] as const;
