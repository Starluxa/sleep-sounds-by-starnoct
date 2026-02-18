import { ITimerPort } from '../../application/timer/ports/ITimerPort';
import { NullTimerAdapter } from './NullTimerAdapter';
import { WebTimerAdapter } from './WebTimerAdapter';
import { CapacitorTimerAdapter } from './CapacitorTimerAdapter';
import { Capacitor } from '@capacitor/core';

export class TimerEngineFactory {
  /**
   * Creates and returns the appropriate ITimerPort implementation.
   */
  public static create(): ITimerPort {
    // Check if we are in a browser environment
    if (typeof window === 'undefined') {
      console.log('[TimerEngineFactory] No window object. Defaulting to NullTimerAdapter.');
      return new NullTimerAdapter();
    }

    // Select adapter based on platform
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      console.log(`[TimerEngineFactory] Native platform detected (${platform}). Using CapacitorTimerAdapter.`);
      return new CapacitorTimerAdapter();
    } else {
      console.log('[TimerEngineFactory] Web platform detected. Using WebTimerAdapter.');
      return new WebTimerAdapter();
    }
  }
}
