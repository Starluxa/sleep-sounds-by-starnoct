export interface ITimerPort {
  /**
   * Schedules a system-level alarm to trigger at the specified timestamp.
   *
   * @param timestamp Unix timestamp (ms) when the alarm should fire.
   */
  setAlarm(timestamp: number): Promise<void>;

  /**
   * Cancels any currently scheduled system-level alarm.
   */
  cancelAlarm(): Promise<void>;

  /**
   * Retrieves the persisted alarm timestamp (ms) or null if none is set.
   */
  getPersistedTimestamp(): Promise<number | null>;

  /**
   * Legacy API: schedule a timer by seconds remaining.
   * @deprecated Use setAlarm(timestamp) instead.
   */
  setSleepTimer(seconds: number): Promise<void>;

  /**
   * Legacy API: cancel the sleep timer.
   * @deprecated Use cancelAlarm() instead.
   */
  cancelSleepTimer(): Promise<void>;

  /**
   * Legacy API: returns relative timer status.
   * @deprecated Use getPersistedTimestamp() instead.
   */
  getTimerStatus(): Promise<{ timeLeft: number; isRunning: boolean }>;
}

