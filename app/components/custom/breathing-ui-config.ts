import { BreathePhase } from '@/core/wellness/breathing/BreathingTypes';

interface PhaseUIConfig {
  readonly label: string;
  readonly color: string;
}

/**
 * UI-specific configuration for breathing phases.
 * This keeps presentation concerns (labels, colors) separate from domain logic.
 */
export const BREATHE_UI_CONFIG: Record<BreathePhase, PhaseUIConfig> = {
  idle: {
    label: 'Ready?',
    color: 'text-white',
  },
  inhale: {
    label: 'Inhale',
    color: 'text-sky-300',
  },
  hold: {
    label: 'Hold',
    color: 'text-purple-300',
  },
  exhale: {
    label: 'Exhale',
    color: 'text-indigo-300',
  },
} as const;
