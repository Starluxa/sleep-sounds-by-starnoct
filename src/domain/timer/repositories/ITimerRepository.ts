import { Duration } from '../shared/value-objects/Duration';

/**
 * Interface for the Timer Repository.
 * Responsible for persisting and hydrating the sleep timer state.
 */
export interface ITimerRepository {
  /**
   * Saves the duration to persistent storage.
   * @param duration The duration to save.
   */
  save(duration: Duration): void;

  /**
   * Loads the duration from persistent storage.
   * Returns null if no duration is stored or if it has expired.
   */
  load(): Duration | null;

  /**
   * Clears the stored duration.
   */
  clear(): void;
}

/**
 * Interface for the Timer Repository.
 * Responsible for persisting and hydrating the sleep timer state.
 */
export interface ITimerRepository {
  /**
   * Saves the duration to persistent storage.
   * @param duration The duration to save.
   */
  save(duration: Duration): void;

  /**
   * Loads the duration from persistent storage.
   * Returns null if no duration is stored or if it has expired.
   */
  load(): Duration | null;

  /**
   * Clears the stored duration.
   */
  clear(): void;
}

