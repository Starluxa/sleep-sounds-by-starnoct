import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IHapticEngine } from '../../core/interfaces/IHapticEngine';
import { BreathePhase } from '../../core/wellness/breathing/BreathingTypes';

/**
 * Capacitor implementation of the IHapticEngine interface.
 * 
 * This adapter wraps the @capacitor/haptics plugin to provide haptic feedback
 * on native devices (iOS/Android) and falls back to the Web Vibration API
 * when running in a browser.
 * 
 * It follows the "Dumb Infrastructure" principle, strictly executing commands
 * without retaining internal business state.
 */
export class CapacitorHapticAdapter implements IHapticEngine {
  /**
   * Plays a haptic pattern corresponding to the given breathing phase.
   * 
   * @param phase The current breathing phase.
   */
  playPhasePattern(phase: BreathePhase): void {
    // Fire and forget to satisfy the interface's void return type
    this.executeHaptic(phase).catch(() => {
      // Silent fail
    });
  }

  /**
   * Stops any currently playing haptic pattern.
   */
  stop(): void {
    try {
      if (!Capacitor.isNativePlatform() && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(0);
      }
      // Note: Capacitor Haptics impact doesn't have a stop method as it's a discrete event.
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Internal helper to execute the haptic feedback based on platform.
   */
  private async executeHaptic(phase: BreathePhase): Promise<void> {
    if (phase === 'idle') return;

    if (Capacitor.isNativePlatform()) {
      await this.executeNativeHaptic(phase);
    } else {
      this.executeWebHaptic(phase);
    }
  }

  /**
   * Executes haptics using Capacitor Haptics plugin.
   */
  private async executeNativeHaptic(phase: BreathePhase): Promise<void> {
    switch (phase) {
      case 'inhale':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'exhale':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'hold':
        // Subtle tick for hold phase
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
    }
  }

  /**
   * Executes haptics using Web Vibration API.
   */
  private executeWebHaptic(phase: BreathePhase): void {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    switch (phase) {
      case 'inhale':
        navigator.vibrate(10);
        break;
      case 'exhale':
        navigator.vibrate(20);
        break;
      case 'hold':
        navigator.vibrate(5);
        break;
    }
  }
}
