import { ITimerPort } from './ports/ITimerPort';
import { Duration } from '../../domain/shared/value-objects/Duration';
import { audioEventBus } from '../../../app/core/audio/AudioEventBus';

export interface TimerStatus {
  isRunning: boolean;
  targetTimestamp: number | null;
}

export interface TimerSnapshot {
  /** Remaining time in seconds (calculated from targetTimestamp - Date.now()) */
  timeLeft: number;
  /** Whether the timer is currently running (not paused/stopped) */
  isRunning: boolean;
  /** Whether the timer is currently paused */
  isPaused: boolean;
  /** Progress from 0 to 1 (how much time has elapsed) */
  progress: number;
  /** The original duration in seconds that the timer was set to */
  originalDuration: number;
}

export class TimerOrchestrator {
  private targetTimestamp: number | null = null;
  private pausedRemainingSeconds: number | null = null;
  private selectedDurationSeconds: number | null = null;
  private listeners: Set<() => void> = new Set();
  private lastSnapshot: TimerSnapshot | null = null;
  private tickerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly timerPort: ITimerPort) {
    void this.timerPort;
  }

  public getStatus(): TimerStatus {
    return {
      isRunning: this.targetTimestamp !== null && this.pausedRemainingSeconds === null,
      targetTimestamp: this.targetTimestamp,
    };
  }

  public getSelectedDurationSeconds(): number {
    return this.selectedDurationSeconds ?? 0;
  }

  public setSelectedDurationSeconds(seconds: number): void {
    if (!Number.isFinite(seconds)) {
      return;
    }

    const normalized = this.normalizeDurationSeconds(seconds);
    if (this.selectedDurationSeconds === normalized) {
      return;
    }

    this.selectedDurationSeconds = normalized;
  }

  private normalizeDurationSeconds(seconds: number): number {
    if (!Number.isFinite(seconds)) {
      return 0;
    }
    return Math.min(Math.max(Math.floor(seconds), 0), Duration.MAX_SECONDS);
  }

  /**
   * Calculates remaining seconds from the target timestamp.
   * Returns 0 if no timer is set or if the timer has expired.
   */
  public getRemainingSeconds(): number {
    if (this.pausedRemainingSeconds !== null) {
      return this.pausedRemainingSeconds;
    }
    if (!this.targetTimestamp) {
      return 0;
    }
    // Use Math.ceil to ensure we show 1s until it actually hits 0
    const remaining = Math.ceil((this.targetTimestamp - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  /**
   * Returns a snapshot of the current timer state for useSyncExternalStore.
   * This is called by React to get the current state during render.
   */
  public getSnapshot(): TimerSnapshot {
    const timeLeft = this.getRemainingSeconds();
    const originalDuration = this.selectedDurationSeconds ?? 0;
    const isPaused = this.pausedRemainingSeconds !== null;
    const isRunning = this.targetTimestamp !== null && !isPaused;
    
    // Calculate progress: 0 = just started, 1 = complete
    let progress = 0;
    if (originalDuration > 0) {
      progress = Math.min(1, Math.max(0, (originalDuration - timeLeft) / originalDuration));
    }

    // Cache the snapshot to avoid infinite loops in useSyncExternalStore
    if (
      this.lastSnapshot &&
      this.lastSnapshot.timeLeft === timeLeft &&
      this.lastSnapshot.isRunning === isRunning &&
      this.lastSnapshot.isPaused === isPaused &&
      this.lastSnapshot.progress === progress &&
      this.lastSnapshot.originalDuration === originalDuration
    ) {
      return this.lastSnapshot;
    }

    this.lastSnapshot = {
      timeLeft,
      isRunning,
      isPaused,
      progress,
      originalDuration,
    };

    return this.lastSnapshot;
  }

  /**
   * Subscribes to timer updates. Returns an unsubscribe function.
   * This is used by useSyncExternalStore to receive notifications.
   */
  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notifies all subscribers that the timer state has changed.
   * This should be called whenever the timer state updates.
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[TimerOrchestrator] Error in listener callback:', error);
      }
    });
  }

  public async syncFromNative(): Promise<void> {
    try {
      const persistedTimestamp = await this.timerPort.getPersistedTimestamp();
      if (!persistedTimestamp || !Number.isFinite(persistedTimestamp)) {
        // If we are paused, don't wipe out the targetTimestamp/paused state
        // because we expect the alarm to be null when paused.
        if (this.pausedRemainingSeconds === null) {
          this.targetTimestamp = null;
          this.stopTicker();
        }
        return;
      }

      if (persistedTimestamp <= Date.now()) {
        this.targetTimestamp = null;
        this.pausedRemainingSeconds = null;
        this.stopTicker();
        return;
      }

      this.targetTimestamp = persistedTimestamp;
      this.pausedRemainingSeconds = null;
      this.startTicker();
      this.notifyListeners();
    } catch (error) {
      console.error('[TimerOrchestrator] Failed to sync from native.', error);
    }
  }

  public async start(duration: Duration, originalDurationSeconds?: number): Promise<void> {
    this.targetTimestamp = duration.targetTimestamp;
    this.pausedRemainingSeconds = null;

    if (typeof originalDurationSeconds === 'number' && Number.isFinite(originalDurationSeconds)) {
      this.setSelectedDurationSeconds(originalDurationSeconds);
    } else if (this.selectedDurationSeconds === null) {
      this.setSelectedDurationSeconds(duration.toSeconds());
    }


    try {
      await this.timerPort.setAlarm(this.targetTimestamp);
      this.startTicker();
      this.notifyListeners();
    } catch (error) {
      console.error('[TimerOrchestrator] Failed to set alarm via timer port.', error);
    }
  }

  public async stop(): Promise<void> {
    this.targetTimestamp = null;
    this.pausedRemainingSeconds = null;
    this.stopTicker();

    try {
      await this.timerPort.cancelAlarm();
      this.notifyListeners();
    } catch (error) {
      console.error('[TimerOrchestrator] Failed to cancel alarm via timer port.', error);
    }
  }

  /**
   * Pauses the timer by freezing the remaining time.
   */
  public async pause(): Promise<void> {
    if (!this.targetTimestamp || this.pausedRemainingSeconds !== null) {
      return;
    }

    const remainingSeconds = this.getRemainingSeconds();
    
    if (remainingSeconds <= 0) {
      // Timer already expired, just stop it
      await this.stop();
      return;
    }

    this.pausedRemainingSeconds = remainingSeconds;
    this.stopTicker();
    

    try {
      await this.timerPort.cancelAlarm();
      this.notifyListeners();
    } catch (error) {
      console.error('[TimerOrchestrator] Failed to cancel alarm on pause.', error);
    }
  }

  /**
   * Resumes the timer by calculating a new target timestamp.
   */
  public async resume(): Promise<void> {
    if (this.pausedRemainingSeconds === null) {
      return;
    }

    
    // Calculate new target timestamp relative to now
    this.targetTimestamp = Date.now() + (this.pausedRemainingSeconds * 1000);
    this.pausedRemainingSeconds = null;
    this.startTicker();
    
    
    try {
      await this.timerPort.setAlarm(this.targetTimestamp);
      this.notifyListeners();
    } catch (error) {
      console.error('[TimerOrchestrator] Failed to set alarm on resume.', error);
    }
  }

  /**
   * Starts the internal ticker that notifies listeners every second.
   */
  private startTicker(): void {
    if (this.tickerInterval) {
      return;
    }

    // Only start if we have a target and are NOT paused
    if (!this.targetTimestamp || this.pausedRemainingSeconds !== null) {
      return;
    }

    this.tickerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Internal tick handler.
   */
  private tick(): void {
    if (this.targetTimestamp && Date.now() >= this.targetTimestamp) {
      void this.executeShutdown();
    } else {
      this.notifyListeners();
    }
  }

  /**
   * Stops the internal ticker.
   */
  private stopTicker(): void {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  /**
   * Executes the shutdown logic when the timer expires.
   */
  private async executeShutdown(): Promise<void> {
    this.targetTimestamp = null;
    this.pausedRemainingSeconds = null;
    this.stopTicker();

    try {
      // 1. Notify the system that the timer expired
      audioEventBus.emit('timer_expired', undefined);

      // 2. Cancel any remaining system alarms
      await this.timerPort.cancelAlarm();

      // 3. Notify UI listeners
      this.notifyListeners();
    } catch (error) {
      console.error('[TimerOrchestrator] Error during timer shutdown:', error);
    }
  }
}

