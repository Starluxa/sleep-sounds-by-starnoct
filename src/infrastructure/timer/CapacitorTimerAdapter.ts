import { ITimerPort } from '../../application/timer/ports/ITimerPort';
import { AudioControl } from '../../../app/lib/native-audio-bridge';
import { Capacitor } from '@capacitor/core';

export class CapacitorTimerAdapter implements ITimerPort {
  async setAlarm(timestamp: number): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    const targetTimestamp = Math.max(0, timestamp);
    const applied = await this.trySetAlarmClock(targetTimestamp);
    if (applied) {
      return;
    }

    const secondsRemaining = Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
    await this.setSleepTimer(secondsRemaining);
  }

  async cancelAlarm(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    const cleared = await this.trySetAlarmClock(0);
    if (cleared) {
      return;
    }

    await this.cancelSleepTimer();
  }

  async getPersistedTimestamp(): Promise<number | null> {
    const audioControl = AudioControl as unknown as {
      getPersistedTimestamp?: () => Promise<{ value: number }>;
    };

    if (typeof audioControl.getPersistedTimestamp === 'function') {
      try {
        const persisted = await audioControl.getPersistedTimestamp();
        const value = persisted?.value ?? 0;
        if (value > 0) {
          return value;
        }
      } catch (error) {
        console.warn('[CapacitorTimerAdapter] Failed to read persisted timestamp, falling back to timer status.', error);
      }
    }

    const status = await this.getTimerStatus();
    if (status.isRunning && status.timeLeft > 0) {
      return Date.now() + status.timeLeft * 1000;
    }
    return null;
  }

  async setSleepTimer(seconds: number): Promise<void> {
    if (Capacitor.getPlatform() === 'android') {
      await AudioControl.setSleepTimer({ durationSec: seconds });
    }
  }

  async cancelSleepTimer(): Promise<void> {
    if (Capacitor.getPlatform() === 'android') {
      await AudioControl.setSleepTimer({ durationSec: 0 });
    }
  }

  async getTimerStatus(): Promise<{ timeLeft: number; isRunning: boolean }> {
    if (Capacitor.getPlatform() === 'android') {
      const status = await AudioControl.getServiceStatus();
      return {
        timeLeft: status.timeLeft,
        isRunning: status.isRunning
      };
    }
    return { timeLeft: 0, isRunning: false };
  }

  private async trySetAlarmClock(targetTimestamp: number): Promise<boolean> {
    const audioControl = AudioControl as unknown as {
      setAlarmClock?: (options: { targetTimestamp: number }) => Promise<void>;
    };

    if (typeof audioControl.setAlarmClock !== 'function') {
      return false;
    }

    try {
      await audioControl.setAlarmClock({ targetTimestamp });
      return true;
    } catch (error) {
      console.warn('[CapacitorTimerAdapter] setAlarmClock failed, falling back to legacy sleep timer.', error);
      return false;
    }
  }
}

