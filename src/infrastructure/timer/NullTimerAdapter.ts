import { ITimerPort } from '../../application/timer/ports/ITimerPort';

export class NullTimerAdapter implements ITimerPort {
  constructor(private readonly logCalls: boolean = false) {}

  public async setAlarm(timestamp: number): Promise<void> {
    this.log('setAlarm', { timestamp });
  }

  public async cancelAlarm(): Promise<void> {
    this.log('cancelAlarm');
  }

  public async getPersistedTimestamp(): Promise<number | null> {
    this.log('getPersistedTimestamp');
    return null;
  }

  public async setSleepTimer(seconds: number): Promise<void> {
    this.log('setSleepTimer', { seconds });
  }

  public async cancelSleepTimer(): Promise<void> {
    this.log('cancelSleepTimer');
  }

  public async getTimerStatus(): Promise<{ timeLeft: number; isRunning: boolean }> {
    this.log('getTimerStatus');
    return { timeLeft: 0, isRunning: false };
  }

  private log(method: string, payload?: Record<string, unknown>): void {
    if (!this.logCalls) {
      return;
    }

    if (payload) {
      console.log(`[NullTimerAdapter] ${method}`, payload);
      return;
    }

    console.log(`[NullTimerAdapter] ${method}`);
  }
}
