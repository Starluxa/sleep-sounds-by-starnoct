import { StateCreator } from 'zustand';
import { ActiveSound, SoundTimer } from '@/types/sounds';
import { handleError } from '../../../utils/error-handler';

import { Duration } from '../../../src/domain/shared/value-objects/Duration';
import { SoundId } from '../../../src/domain/sounds/dtos/SoundState';

/** Default timer duration in seconds (15 minutes) */
const DEFAULT_TIMER_SECONDS = 15 * 60;

// MixEntity Integration Imports
import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';
import { MixDomainError } from '../../../src/domain/sounds/errors/MixDomainError';

// Audio Orchestrator Imports
import { AudioPort } from '../../application/audio/AudioPort';
import { AudioEngineFactory } from '../../infrastructure/audio/AudioEngineFactory';
import { IAudioPort } from '../../core/audio/IAudioPort';
import { SyncMixUseCase } from '../../application/audio/SyncMixUseCase';
import { mapActiveSoundsToMix } from '../../application/audio/mappers';
import { audioEventBus } from '../../core/audio/AudioEventBus';

// Timer Orchestrator Imports
import { TimerOrchestrator } from '../../../src/application/timer';
import { TimerEngineFactory } from '../../../src/infrastructure/timer';

// Central Store Types
import { StoreState } from './store-types';

/**
 * Helper to ensure the sleep timer is running when a sound is added.
 * Always resets timer to selectedTime (max time user set) when adding a new sound.
 */
function ensureTimerRunning(current: StoreState): {
  newTimerState: StoreState['sleepTimer'],
  startOrchestrator: () => void
} {
  // Always reset to selectedTime when adding a sound
  const defaultDuration = current.sleepTimer.selectedTime > 0
    ? current.sleepTimer.selectedTime
    : DEFAULT_TIMER_SECONDS;

  const newTimerState = {
    ...current.sleepTimer,
    timeLeft: defaultDuration,
    totalTime: defaultDuration,
    isRunning: true
  };

  const startOrchestrator = () => {
    void current.timerOrchestrator?.start(
      Duration.fromNow(defaultDuration),
      defaultDuration
    );
  };

  return { newTimerState, startOrchestrator };
}

export interface AudioSlice {
  audioLoading: { [key: SoundId]: boolean };
  audioErrors: { [key: SoundId]: string };
  showLimitDialog: boolean;
  hasUserGesture: boolean;
  autoplayBlocked: boolean;
  /**
   * Single authoritative audio engine selector.
   * - 'web': WebView <audio> + WebAudio (foreground)
   * - 'native': Android foreground service playback (background)
   */
  audioEngine: 'web' | 'native';
  currentMixKey?: string;

  // MixEntity Integration State
  mixEntity: MixEntity | null;
  audioPort: IAudioPort | null;
  syncMixUseCase: SyncMixUseCase | null;
  timerOrchestrator: TimerOrchestrator | null;

  // Existing Actions
  setShowLimitDialog: (show: boolean) => void;
  setAudioEngine: (engine: 'web' | 'native') => void;
  addSound: (soundId: SoundId) => void;
  removeSound: (soundId: SoundId) => void;
  /**
   * Update volume using fast-path transient gain calculation
   * @param soundId - The unique identifier of the sound
   * @param volume - The new volume level (0-100)
   */
  updateVolume: (soundId: SoundId, volume: number) => void;
  setAudioLoading: (soundId: SoundId, isLoading: boolean) => void;
  setAudioError: (soundId: SoundId, errorMsg: string | null) => void;
  togglePausePlay: () => void;
  setHasUserGesture: (has: boolean) => void;
  setAutoplayBlocked: (blocked: boolean) => void;
  /**
   * Sets the active mix.
   * @param mix - Either a MixEntity or an array of legacy ActiveSound objects.
   */
  setMix: (mix: MixEntity | ActiveSound[]) => void;

  // MixEntity Integration Actions
  /**
   * Initialize MixEntity and orchestrators on app startup
   */
  initializeMixEntity: () => void;
}

/**
 * Audio Slice - Manages the "Mixing Desk" state for active sounds, audio loading, and errors.
 *
 * Uses MixEntity as the single source of truth for audio state and validation.
 * Structural updates use immutable entity methods, while transient updates (volume)
 * are optimized for performance.
 * 
 * Pattern: StateCreator<StoreState, [], [], AudioSlice>
 */
export const createAudioSlice: StateCreator<StoreState, [], [], AudioSlice> = (set, get) => {
  return {
    // State
    audioLoading: {},
    audioErrors: {},
    showLimitDialog: false,
    hasUserGesture: false,
    autoplayBlocked: false,
    audioEngine: 'web',
    currentMixKey: undefined,

    // MixEntity Integration State
    mixEntity: null,
    audioPort: null,
    syncMixUseCase: null,
    timerOrchestrator: null,

  // Actions
  setShowLimitDialog: (show: boolean) => set({ showLimitDialog: show }),

  setAudioEngine: (engine: 'web' | 'native') => set({ audioEngine: engine }),

  /**
   * Composition Root: Initializes the audio infrastructure including MixEntity,
   * AudioPort, SyncMixUseCase, and TimerOrchestrator.
   *
   * This function wires together all dependencies and sets up event subscriptions.
   * It follows the Composition Root pattern where object graph construction is
   * centralized and separate from business logic.
   */
  initializeMixEntity: (): void => {
    const current = get();

    if (current.mixEntity && current.audioPort && current.timerOrchestrator && current.syncMixUseCase && (current.mixEntity instanceof MixEntity)) {
      return;
    }

    let initialMix = current.mixEntity;

    if (!initialMix) {
      initialMix = MixEntity.create();
    }

    const engine = AudioEngineFactory.getInstance();
    const audioPort = new AudioPort(engine, (soundId: SoundId) => {
      // Track lifecycle: preserve in mix for resume capability (see DEVELOPER.md)
      set((state) => {
        const isPaused = (state.mixEntity?.trackCount || 0) === 0 ? true : state.isPaused;

        return {
          ...state,
          isPaused
        };
      });
    });

    const syncMixUseCase = new SyncMixUseCase(audioPort);

    const timerEngine = TimerEngineFactory.create();
    const timerOrchestrator = new TimerOrchestrator(timerEngine);

    audioEventBus.subscribe('timer_expired', () => {
      const current = get();

      if (current.audioPort) {
        void current.audioPort.stopAll();
      }

      set((state) => ({
        ...state,
        isPaused: true,
        sleepTimer: {
          ...state.sleepTimer,
          isRunning: false,
          timeLeft: 0,
        },
      }));
    });

    void timerOrchestrator.syncFromNative();

    set({
      mixEntity: initialMix,
      audioPort,
      syncMixUseCase,
      timerOrchestrator
    });
  },

  /**
   * Adds a sound to the active mix using MixEntity validation.
   */
  addSound: (soundId: string): void => {
    set((state) => {
      const { mixEntity } = state;

      if (!mixEntity) {
        return state;
      }

      try {
        if (mixEntity.trackCount >= 10) {
          return { ...state, showLimitDialog: true };
        }

        const newMix = mixEntity.addTrack(soundId, 50);

        // Sync is handled by hooks (useAndroidAudio/useAudioController)
        const { newTimerState, startOrchestrator } = ensureTimerRunning(state);
        startOrchestrator();

        return {
          ...state,
          mixEntity: newMix,
          isPaused: false,
          sleepTimer: newTimerState
        };
      } catch (error) {
        if (error instanceof MixDomainError) {
          handleError(error);
          if (error.code === 'LIMIT_EXCEEDED') {
            return { ...state, showLimitDialog: true };
          }
        }
        return state;
      }
    });
  },

  /**
   * Removes a sound from the active mix using MixEntity.
   */
  removeSound: (soundId: string): void => {
    set((state) => {
      const { mixEntity } = state;

      if (!mixEntity) {
        return state;
      }

      try {
        if (!mixEntity.getTrack(soundId)) {
          return state;
        }

        const newMix = mixEntity.removeTrack(soundId);

        // When the last sound is removed, stop the timer and reset it
        if (newMix.trackCount === 0) {
          void state.timerOrchestrator?.stop();
          return {
            ...state,
            mixEntity: newMix,
            isPaused: true,
            sleepTimer: {
              ...state.sleepTimer,
              isRunning: false,
              timeLeft: state.sleepTimer.selectedTime,
              totalTime: state.sleepTimer.selectedTime,
            },
          };
        }

        // Sync is handled by hooks
        return {
          ...state,
          mixEntity: newMix,
        };
      } catch (error) {
        if (error instanceof MixDomainError) {
          handleError(error);
        }
        return state;
      }
    });
  },

  /**
   * Updates the volume of a specific sound using MixEntity fast-path.
   */
  updateVolume: (soundId: string, volume: number): void => {
    const current = get();
    const { mixEntity } = current;

    if (!mixEntity) {
      return;
    }

    const minVol = MixEntity.getMinVolume();
    const maxVol = MixEntity.getMaxVolume();
    const clampedVolume = Math.min(maxVol, Math.max(minVol, Math.round(volume)));

    // Sync is handled by hooks with 60Hz throttling
    const newMix = mixEntity.updateTrackVolume(soundId, clampedVolume);

    if (newMix === mixEntity) return;

    set({
      mixEntity: newMix
    });
  },

  setAudioLoading: (soundId: string, isLoading: boolean): void => {
    set((state) => ({ ...state, audioLoading: { ...state.audioLoading, [soundId]: isLoading } }));
  },

  setAudioError: (soundId: string, errorMsg: string | null): void => {
    set((state) => ({ ...state, audioErrors: { ...state.audioErrors, [soundId]: errorMsg || '' } }));
  },

  togglePausePlay: (): void => {
    set((state) => {
      const { mixEntity, isPaused: currentIsPaused, sleepTimer, timerOrchestrator } = state;
      const isResuming = currentIsPaused;

      if (isResuming && (!mixEntity || mixEntity.trackCount === 0)) {
        return state;
      }

      const newTimerState = { ...sleepTimer };

      if (isResuming) {
        if (newTimerState.timeLeft === 0 && newTimerState.selectedTime > 0) {
            newTimerState.timeLeft = newTimerState.selectedTime;
            newTimerState.totalTime = newTimerState.selectedTime;
        }

        if (newTimerState.timeLeft > 0) {
            newTimerState.isRunning = true;
            // Check if orchestrator has paused state - if not, start fresh timer
            const orchestratorStatus = timerOrchestrator?.getStatus();
            if (orchestratorStatus?.isRunning === false && orchestratorStatus?.targetTimestamp === null) {
              // No active or paused timer in orchestrator - start fresh
              void timerOrchestrator?.start(
                Duration.fromNow(newTimerState.timeLeft),
                newTimerState.selectedTime
              );
            } else {
              // Has paused state - resume normally
              void timerOrchestrator?.resume();
            }
        }
      } else {
        newTimerState.isRunning = false;
        void timerOrchestrator?.pause();
      }

      return {
        ...state,
        isPaused: !isResuming,
        sleepTimer: newTimerState,
      };
    });
  },

  setHasUserGesture: (has: boolean) => set({ hasUserGesture: has }),

  setAutoplayBlocked: (blocked: boolean) => set({ autoplayBlocked: blocked }),

  setMix: (mix: MixEntity | ActiveSound[]): void => {
    const newMix = mix instanceof MixEntity ? mix : mapActiveSoundsToMix(mix);

    set({
      mixEntity: newMix,
      isPaused: false,
      showLimitDialog: false
    });
  },
};
};
