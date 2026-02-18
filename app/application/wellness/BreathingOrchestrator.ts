import { BreathingSession } from '../../core/wellness/breathing/BreathingSession';
import { IHapticEngine } from '../../core/interfaces/IHapticEngine';
import { 
  BreathingSessionState, 
  BreathingWorkerEvent, 
  BreathingWorkerCommand,
  BreathePhase
} from '../../core/wellness/breathing/BreathingTypes';
import { DEFAULT_BREATHING_PATTERN } from '../../core/wellness/breathing/BreathingConstants';

/**
 * Orchestrates the breathing exercise by coordinating the high-precision timer (Worker),
 * the domain logic (BreathingSession), and the haptic feedback (IHapticEngine).
 */
export class BreathingOrchestrator {
  private worker: Worker | null = null;
  private listeners: ((state: BreathingSessionState) => void)[] = [];
  private lastPhase: BreathePhase = 'idle';
  
  // Stable UI state to minimize React re-renders
  private uiState = {
    phase: 'idle' as BreathePhase,
    timeLeft: 0,
    cycleCount: 0,
    totalTime: 0,
    isRunning: false,
    isPaused: false
  };

  constructor(
    private readonly session: BreathingSession,
    private readonly haptics: IHapticEngine
  ) {}

  public subscribe(listener: (state: BreathingSessionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getState(): BreathingSessionState {
    return this.session.getState();
  }

  /**
   * Returns a stable UI-focused snapshot.
   * useSyncExternalStore will use this to avoid re-rendering on every 10ms tick.
   */
  public getUISnapshot() {
    return this.uiState;
  }

  private notifyListeners(): void {
    const state = this.session.getState();
    this.listeners.forEach(listener => listener(state));
  }

  public start(): void {
    // If a worker already exists, we're either already running or currently paused.
    // In the paused case, we keep the same Worker instance alive to preserve its
    // performance.now() time origin and avoid timestamp regressions on resume.
    if (!this.worker) {
      this.worker = new Worker(
        new URL('../../infrastructure/workers/breathing-timer.worker.ts', import.meta.url)
      );

      this.worker.onmessage = (event: MessageEvent<BreathingWorkerEvent>) => {
        this.handleWorkerMessage(event.data);
      };
    }

    // Start or resume the domain session.
    this.session.start(performance.now());

    const state = this.session.getState();
    this.lastPhase = state.phase;

    // Resume ticking (idempotent in the worker).
    const startCommand: BreathingWorkerCommand = { type: 'START' };
    this.worker.postMessage(startCommand);

    // Trigger phase haptics only when transitioning into an active (non-paused) state.
    if (this.lastPhase !== 'idle' && !state.isPaused) {
      this.haptics.playPhasePattern(this.lastPhase);
    }

    this.updateUIState(state);
    this.notifyListeners();
  }

  /**
   * Pauses the breathing session.
   */
  public pause(): void {
    if (!this.worker) return;

    // Pause the domain clock first.
    this.session.pause(performance.now());

    // Stop worker ticks but keep the worker instance alive so its timestamp domain
    // stays consistent across pause/resume.
    const stopCommand: BreathingWorkerCommand = { type: 'STOP' };
    this.worker.postMessage(stopCommand);

    this.haptics.stop();

    this.updateUIState(this.session.getState());
    this.notifyListeners();
  }

  public stop(): void {
    this.reset();
  }

  public reset(): void {
    if (this.worker) {
      // Ensure the worker is fully stopped before terminating.
      const stopCommand: BreathingWorkerCommand = { type: 'STOP' };
      this.worker.postMessage(stopCommand);
      this.worker.terminate();
      this.worker = null;
    }

    this.session.reset();
    this.lastPhase = 'idle';
    this.haptics.stop();
    this.updateUIState(this.session.getState());
    this.notifyListeners();
  }

  public destroy(): void {
    this.reset();
    this.listeners = [];
  }

  private handleWorkerMessage(event: BreathingWorkerEvent): void {
    switch (event.type) {
      case 'TICK':
        // Important: do NOT trust Worker-side performance.now() timestamps here.
        // A Worker can have a different time origin than the Window, and if the
        // Worker is ever recreated, its clock domain can reset, causing "time
        // regression" (elapsed time going backwards after resume).
        //
        // We use the tick as a pacemaker signal only and sample the Window clock
        // (performance.now()) as the single source of time truth for the Domain.
        this.processTick(event.timestamp);
        break;
      case 'ERROR':
        this.stop();
        break;
    }
  }

  private processTick(_timestamp: number): void {
    const now = performance.now();
    const state = this.session.update(now);

    if (state.phase !== this.lastPhase) {
      this.haptics.playPhasePattern(state.phase);
      this.lastPhase = state.phase;
    }

    this.updateUIState(state);
    this.notifyListeners();
  }

  private updateUIState(state: BreathingSessionState): void {
    const duration = DEFAULT_BREATHING_PATTERN[state.phase]?.duration || 0;
    const timeLeft = duration > 0 
      ? Math.ceil((duration * (1 - state.progress)) / 1000)
      : 0;
    const totalTime = Math.floor(state.totalElapsed / 1000);

    // Only update the uiState object if the values actually changed
    if (
      this.uiState.phase !== state.phase ||
      this.uiState.timeLeft !== timeLeft ||
      this.uiState.cycleCount !== state.cycleCount ||
      this.uiState.totalTime !== totalTime ||
      this.uiState.isRunning !== state.isRunning ||
      this.uiState.isPaused !== state.isPaused
    ) {
      this.uiState = {
        phase: state.phase,
        timeLeft,
        cycleCount: state.cycleCount,
        totalTime,
        isRunning: state.isRunning,
        isPaused: state.isPaused
      };
    }
  }
}
