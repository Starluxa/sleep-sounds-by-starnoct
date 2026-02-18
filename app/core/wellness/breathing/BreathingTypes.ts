/**
 * Core domain types for the breathing feature.
 * These types are platform-agnostic and contain no UI or framework dependencies.
 */

/**
 * Represents the different phases of a breathing cycle.
 */
export type BreathePhase = 'idle' | 'inhale' | 'hold' | 'exhale';

/**
 * Configuration for a single breathing phase.
 * Contains only domain-specific data.
 */
export interface PhaseDomainConfig {
  readonly duration: number;
}

/**
 * A collection of phase configurations indexed by the phase type.
 */
export type BreathingPattern = Record<BreathePhase, PhaseDomainConfig>;

/**
 * Messages sent to the breathing timer worker.
 */
export type BreathingWorkerCommand = 
  | { type: 'START' }
  | { type: 'STOP' };

/**
 * Messages sent from the breathing timer worker.
 */
export type BreathingWorkerEvent = 
  | { type: 'TICK'; timestamp: number }
  | { type: 'ERROR'; message: string };

/**
 * The immutable state of a breathing session at a specific point in time.
 */
export interface BreathingSessionState {
  readonly phase: BreathePhase;
  readonly progress: number; // 0.0 to 1.0
  readonly cycleCount: number;
  readonly phaseStartTime: number;
  readonly totalElapsed: number;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
}
