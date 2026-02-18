import { ITimerPort } from '../../application/timer/ports/ITimerPort';

export class WebTimerAdapter implements ITimerPort {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private targetTimestamp: number | null = null;
  private readonly STORAGE_KEY = 'lux_timer_target_timestamp';

  public async setAlarm(timestamp: number): Promise<void> {
    this.cancelAlarmSync();

    this.targetTimestamp = timestamp;
    this.persistTimestamp(timestamp);

    const delay = Math.max(0, timestamp - Date.now());

    this.timeoutId = setTimeout(() => {
      this.handleTimerTrigger();
    }, delay);
  }

  public async cancelAlarm(): Promise<void> {
    this.cancelAlarmSync();
  }

  public async getPersistedTimestamp(): Promise<number | null> {
    const stored = this.readPersistedTimestamp();
    if (stored !== null) {
      return stored;
    }

    return this.targetTimestamp;
  }

  public async setSleepTimer(seconds: number): Promise<void> {
    const safeSeconds = Math.max(0, seconds);
    const targetTimestamp = Date.now() + safeSeconds * 1000;
    await this.setAlarm(targetTimestamp);
  }

  public async cancelSleepTimer(): Promise<void> {
    await this.cancelAlarm();
  }

  public async getTimerStatus(): Promise<{ timeLeft: number; isRunning: boolean }> {
    const target = await this.getPersistedTimestamp();
    if (!target) {
      return { timeLeft: 0, isRunning: false };
    }

    const timeLeft = Math.max(0, Math.ceil((target - Date.now()) / 1000));
    return { timeLeft, isRunning: timeLeft > 0 };
  }

  private handleTimerTrigger(): void {
    if (this.targetTimestamp === null) {
      return;
    }

    const now = Date.now();
    if (now < this.targetTimestamp) {
      this.scheduleTimeout(this.targetTimestamp);
      return;
    }

    this.cancelAlarmSync();
  }

  private scheduleTimeout(targetTimestamp: number): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const delay = Math.max(0, targetTimestamp - Date.now());
    this.timeoutId = setTimeout(() => {
      this.handleTimerTrigger();
    }, delay);
  }

  private cancelAlarmSync(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.targetTimestamp = null;
    this.clearPersistedTimestamp();
  }

  private persistTimestamp(timestamp: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage?.setItem(this.STORAGE_KEY, timestamp.toString());
    } catch (error) {
      // Failed to persist timestamp
    }
  }

  private readPersistedTimestamp(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = window.localStorage?.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = Number(stored);
      return Number.isFinite(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  private clearPersistedTimestamp(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage?.removeItem(this.STORAGE_KEY);
    } catch (error) {
      // Failed to clear timestamp
    }
  }
}
