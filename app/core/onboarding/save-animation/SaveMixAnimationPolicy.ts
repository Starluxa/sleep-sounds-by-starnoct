import type { SaveAnimationState, HeartState, RingState, SparkleState, ISaveAnimationPolicy } from './types';
import { SAVE_GEOMETRY } from './SaveGeometry';

import type { SaveSparkleGeometry } from './SaveGeometry';

/**
 * Pure domain animation policy for SaveMix heart animation.
 * Computes frame states from timestamp using math-only logic.
 * Accessibility-first: constructor-injected reducedMotion returns static rest state.
 * No UI/framework/native deps; injected boolean keeps core pure.
 * Static rest: heart/rings scale=1.0 opacity=1.0; sparkles opacity=0.0 hidden.
 * Fulfills WCAG 2.2.2 Pause/Stop/Hide motion (2026 standards compliant).
 */
class SaveMixAnimationPolicy implements ISaveAnimationPolicy {
  /**
   * @param reducedMotion - Boolean from UI adapter (matchMedia('(prefers-reduced-motion: reduce)') or context).
   * Enables static frame output, no time-based animation.
   */
  constructor(readonly reducedMotion: boolean) {}

  /**
   * Computes the animation state for the given timestamp.
   * If reducedMotion, ignores timestamp and returns static rest immediately.
   * @param timestampMs - Current time in ms (monotonic clock).
   * @returns Immutable SaveAnimationState.
   */
  computeFrame(timestampMs: number): SaveAnimationState {
    if (this.reducedMotion) {
      const heart: HeartState = {
        scale: 1.0,
        opacity: 1.0,
      };

      const outerRing: RingState = {
        scale: 1.0,
        opacity: 1.0,
      };

      const middleRing: RingState = {
        scale: 1.0,
        opacity: 1.0,
      };

      const sparkles: SparkleState[] = SAVE_GEOMETRY.sparkles.map((geo: SaveSparkleGeometry) => ({
        scale: 1.0,
        opacity: 0.0,
        rotation: 0.0,
        x: geo.position[0],
        y: geo.position[1],
      }));

      return {
        heart,
        outerRing,
        middleRing,
        sparkles,
      } as const;
    }

    const timeSeconds = timestampMs / 1000;

    // Heart: ~1.5s cycle pulse
    const HEART_PERIOD = 1.5;
    const heartNormTime = (timeSeconds % HEART_PERIOD) / HEART_PERIOD;
    const heartPhase = heartNormTime * 2 * Math.PI;
    const heartPulse = (Math.sin(heartPhase) + 1) / 2;
    const heart: HeartState = {
      scale: 1.0 + 0.1 * heartPulse,
      opacity: 0.7 + 0.3 * heartPulse,
    };

    // Outer Ring: 2s slow ping expand/fade (Linear ramp matching original ping-slow)
    const OUTER_PERIOD = 2.0;
    const outerNormTime = (timeSeconds % OUTER_PERIOD) / OUTER_PERIOD;
    const outerRing: RingState = {
      scale: 1.0 + 0.8 * outerNormTime,
      opacity: 0.8 * (1 - outerNormTime),
    };

    // Middle Ring: pulse ~1.2s (Linear ramp, slightly faster)
    const MIDDLE_PERIOD = 1.2;
    const middleNormTime = (timeSeconds % MIDDLE_PERIOD) / MIDDLE_PERIOD;
    const middleRing: RingState = {
      scale: 1.0 + 0.4 * middleNormTime,
      opacity: 0.6 * (1 - middleNormTime),
    };

    // Sparkles: staggered delays 0/0.3/0.6s, 2s cycle (matching original animate-sparkle)
    const SPARKLE_PERIOD = 2.0;
    const DELAYS = [0, 0.3, 0.6] as const;
    const sparkles: SparkleState[] = SAVE_GEOMETRY.sparkles.map(
      (geo: SaveSparkleGeometry, index: number) => {
        const delay = DELAYS[index];
        let sparkleTime = (timeSeconds - delay) % SPARKLE_PERIOD;
        if (sparkleTime < 0) sparkleTime += SPARKLE_PERIOD;
        const sparkleNormTime = sparkleTime / SPARKLE_PERIOD;
        const sparklePhase = sparkleNormTime * 2 * Math.PI;
        const sparklePulse = (Math.sin(sparklePhase) + 1) / 2;
        const rotationPulse = (Math.sin(sparklePhase + Math.PI / 2) + 1) / 2; // offset for variety
        return {
          scale: sparklePulse,
          opacity: sparklePulse,
          rotation: rotationPulse * 180,
          x: geo.position[0],
          y: geo.position[1],
        };
      }
    );

    return {
      heart,
      outerRing,
      middleRing,
      sparkles,
    } as const;
  }
}

export { SaveMixAnimationPolicy };