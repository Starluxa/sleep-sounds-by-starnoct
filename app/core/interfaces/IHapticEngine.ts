import { BreathePhase } from '../wellness/breathing/BreathingTypes';

/**
 * Platform-agnostic interface for triggering haptic feedback patterns.
 * 
 * This interface abstracts the underlying haptic implementation (Android, iOS, or Web)
 * and provides a high-level API for the Application layer to command haptics
 * without knowing the platform-specific details.
 * 
 * Rhythmic patterns are managed by the implementation to ensure precision
 * and reliability across different devices.
 */
export interface IHapticEngine {
  /**
   * Plays a haptic pattern corresponding to the given breathing phase.
   * The implementation should handle the specific pattern (e.g., intensity, duration, rhythm)
   * for each phase.
   * 
   * @param phase The current breathing phase to play the pattern for.
   */
  playPhasePattern(phase: BreathePhase): void;

  /**
   * Stops any currently playing haptic pattern.
   * This should be called when the breathing session is paused, stopped, or reset.
   */
  stop(): void;
}
