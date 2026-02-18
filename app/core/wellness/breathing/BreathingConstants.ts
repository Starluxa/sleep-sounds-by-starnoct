import { BreathingPattern } from './BreathingTypes';

/**
 * Core domain constants for the breathing feature.
 * These constants define the business rules (durations) for breathing patterns.
 */

/**
 * The default breathing pattern (4-7-8 technique).
 * Durations are in milliseconds.
 */
export const DEFAULT_BREATHING_PATTERN: BreathingPattern = {
  idle: {
    duration: 0,
  },
  inhale: {
    duration: 4000,
  },
  hold: {
    duration: 7000,
  },
  exhale: {
    duration: 8000,
  },
} as const;

/**
 * The sequence of phases in a standard breathing cycle.
 */
export const BREATHING_PHASE_SEQUENCE: string[] = ['inhale', 'hold', 'exhale'];
