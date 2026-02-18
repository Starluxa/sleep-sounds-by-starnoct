import { 
  BreathePhase, 
  BreathingPattern, 
  BreathingSessionState 
} from './BreathingTypes';
import { 
  DEFAULT_BREATHING_PATTERN, 
  BREATHING_PHASE_SEQUENCE 
} from './BreathingConstants';

/**
 * Pure domain entity that manages the state of a breathing session.
 * It calculates progress and phase transitions based on high-precision ticks.
 * This class is platform-agnostic and contains no side effects.
 */
export class BreathingSession {
  private state: BreathingSessionState;
  private readonly pattern: BreathingPattern;
  private readonly sequence: BreathePhase[];
  private isRunning: boolean = false;
  private sessionStartTime: number = 0;
  private pauseTime: number = 0;
  private lastTimestamp: number = 0;

  constructor(
    pattern: BreathingPattern = DEFAULT_BREATHING_PATTERN,
    sequence: string[] = BREATHING_PHASE_SEQUENCE
  ) {
    this.pattern = pattern;
    this.sequence = sequence as BreathePhase[];
    this.state = this.getInitialState();
  }

  /**
   * Starts the session at the given timestamp.
   * If already running but paused, it resumes.
   */
  public start(timestamp: number): void {
    if (this.isRunning) {
      if (this.state.isPaused) {
        this.resume(timestamp);
      }
      return;
    }
    
    this.isRunning = true;
    this.sessionStartTime = timestamp;
    this.lastTimestamp = timestamp;
    this.state = {
      ...this.state,
      phase: this.sequence[0],
      phaseStartTime: timestamp,
      isRunning: true,
      isPaused: false,
    };
  }

  /**
   * Pauses the session.
   */
  public pause(timestamp: number): void {
    if (!this.isRunning || this.state.isPaused) return;
    this.pauseTime = timestamp;
    this.lastTimestamp = timestamp;
    this.state = {
      ...this.state,
      isPaused: true
    };
  }

  /**
   * Resumes the session.
   */
  private resume(timestamp: number): void {
    // Guard against any clock regression or double-resume edge cases.
    // If the time source ever goes backwards, we refuse to apply a negative pause.
    if (timestamp <= this.pauseTime) {
      this.state = {
        ...this.state,
        isPaused: false,
      };
      this.pauseTime = 0;
      this.lastTimestamp = Math.max(this.lastTimestamp, timestamp);
      return;
    }

    const pauseDuration = timestamp - this.pauseTime;
    this.sessionStartTime += pauseDuration;
    this.state = {
      ...this.state,
      phaseStartTime: this.state.phaseStartTime + pauseDuration,
      isPaused: false
    };

    // Clear pause marker and rebase the monotonic guard.
    this.pauseTime = 0;
    this.lastTimestamp = timestamp;
  }

  /**
   * Updates the session state based on the current timestamp.
   */
  public update(timestamp: number): BreathingSessionState {
    if (!this.isRunning || this.state.isPaused) return this.state;

    // Monotonic safety: ignore any tick that would move time backwards.
    // This prevents temporal regression if the caller accidentally mixes time domains.
    if (timestamp < this.lastTimestamp) {
      return this.state;
    }
    this.lastTimestamp = timestamp;

    let currentPhaseDuration = this.pattern[this.state.phase].duration;
    let elapsedInPhase = timestamp - this.state.phaseStartTime;

    // Handle phase transitions
    while (elapsedInPhase >= currentPhaseDuration && currentPhaseDuration > 0) {
      this.transitionToNextPhase();
      
      currentPhaseDuration = this.pattern[this.state.phase].duration;
      elapsedInPhase = timestamp - this.state.phaseStartTime;
    }

    const progress = currentPhaseDuration > 0 
      ? Math.min(1.0, Math.max(0.0, elapsedInPhase / currentPhaseDuration))
      : 0;

    this.state = {
      ...this.state,
      progress,
      totalElapsed: timestamp - this.sessionStartTime,
    };
    
    return this.state;
  }

  /**
   * Resets the session to its initial state.
   */
  public reset(): void {
    this.isRunning = false;
    this.sessionStartTime = 0;
    this.pauseTime = 0;
    this.lastTimestamp = 0;
    this.state = this.getInitialState();
  }

  /**
   * Returns the current immutable state.
   */
  public getState(): BreathingSessionState {
    return this.state;
  }

  private transitionToNextPhase(): void {
    const currentIndex = this.sequence.indexOf(this.state.phase);
    const nextIndex = (currentIndex + 1) % this.sequence.length;
    const nextPhase = this.sequence[nextIndex];
    
    let newCycleCount = this.state.cycleCount;
    if (nextIndex === 0) {
      newCycleCount++;
    }

    const currentPhaseDuration = this.pattern[this.state.phase].duration;
    const exactPhaseEndTime = this.state.phaseStartTime + currentPhaseDuration;

    this.state = {
      ...this.state,
      phase: nextPhase,
      phaseStartTime: exactPhaseEndTime,
      cycleCount: newCycleCount,
      progress: 0,
    };
  }

  private getInitialState(): BreathingSessionState {
    return {
      phase: 'idle',
      progress: 0,
      cycleCount: 0,
      phaseStartTime: 0,
      totalElapsed: 0,
      isRunning: false,
      isPaused: false,
    };
  }
}
