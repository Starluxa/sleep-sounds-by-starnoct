import { Duration } from '../../domain/shared/value-objects/Duration';
import { ITimerRepository } from '../../domain/timer/repositories/ITimerRepository';

/**
 * Implementation of ITimerRepository using localStorage for Web
 * and potentially Capacitor Preferences for Native (if available).
 * 
 * The stored JSON format is { "targetTimestamp": 1234567890 }.
 */
export class TimerRepository implements ITimerRepository {
  private readonly STORAGE_KEY = 'lux_sleep_timer';

  /**
   * Saves the duration to persistent storage.
   * @param duration The duration to save.
   */
  public save(duration: Duration): void {
    const data = {
      targetTimestamp: duration.targetTimestamp
    };
    
    const json = JSON.stringify(data);
    
    // Save to localStorage (Web)
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.STORAGE_KEY, json);
    }

    // Note: Synchronization with Native SharedPreferences is typically handled 
    // by Capacitor Plugins or by the Native side observing changes if using 
    // a shared storage mechanism. For this implementation, we focus on the 
    // Web/Capacitor bridge via localStorage which Capacitor often persists.
  }

  /**
   * Loads the duration from persistent storage.
   * Returns null if no duration is stored or if it has expired.
   */
  public load(): Duration | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const json = window.localStorage.getItem(this.STORAGE_KEY);
    if (!json) {
      return null;
    }

    try {
      const data = JSON.parse(json);
      
      if (typeof data.targetTimestamp !== 'number') {
        return null;
      }

      const duration = Duration.fromTargetTimestamp(data.targetTimestamp);

      // Ensure it handles cases where the stored timestamp is in the past (expired timer)
      if (duration.isExpired) {
        this.clear();
        return null;
      }

      return duration;
    } catch (error) {
      console.error('Failed to parse stored timer duration:', error);
      this.clear();
      return null;
    }
  }

  /**
   * Clears the stored duration.
   */
  public clear(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
import { ITimerRepository } from '../../domain/timer/repositories/ITimerRepository';

/**
 * Implementation of ITimerRepository using localStorage for Web
 * and potentially Capacitor Preferences for Native (if available).
 * 
 * The stored JSON format is { "targetTimestamp": 1234567890 }.
 */
export class TimerRepository implements ITimerRepository {
  private readonly STORAGE_KEY = 'lux_sleep_timer';

  /**
   * Saves the duration to persistent storage.
   * @param duration The duration to save.
   */
  public save(duration: Duration): void {
    const data = {
      targetTimestamp: duration.targetTimestamp
    };
    
    const json = JSON.stringify(data);
    
    // Save to localStorage (Web)
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.STORAGE_KEY, json);
    }

    // Note: Synchronization with Native SharedPreferences is typically handled 
    // by Capacitor Plugins or by the Native side observing changes if using 
    // a shared storage mechanism. For this implementation, we focus on the 
    // Web/Capacitor bridge via localStorage which Capacitor often persists.
  }

  /**
   * Loads the duration from persistent storage.
   * Returns null if no duration is stored or if it has expired.
   */
  public load(): Duration | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const json = window.localStorage.getItem(this.STORAGE_KEY);
    if (!json) {
      return null;
    }

    try {
      const data = JSON.parse(json);
      
      if (typeof data.targetTimestamp !== 'number') {
        return null;
      }

      const duration = Duration.fromTargetTimestamp(data.targetTimestamp);

      // Ensure it handles cases where the stored timestamp is in the past (expired timer)
      if (duration.isExpired) {
        this.clear();
        return null;
      }

      return duration;
    } catch (error) {
      console.error('Failed to parse stored timer duration:', error);
      this.clear();
      return null;
    }
  }

  /**
   * Clears the stored duration.
   */
  public clear(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

