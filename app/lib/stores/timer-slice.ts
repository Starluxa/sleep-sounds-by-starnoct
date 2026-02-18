import { StateCreator } from 'zustand';
import { SoundTimer } from '@/types/sounds';
import { getMaxTimerForSounds } from '../utils';
import { Duration } from '../../../src/domain/shared/value-objects/Duration';
import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';
import { SoundId } from '../../../src/domain/sounds/dtos/SoundState';

// Central Store Types
import { StoreState } from './store-types';

// Timer Slice interface
export interface TimerSlice {
  sleepTimer: {
    timeLeft: number;
    totalTime: number;
    isRunning: boolean;
    selectedTime: number;
    soundDefaults: { [soundId: SoundId]: number };
  };
  soundTimer: SoundTimer | null;
  setSleepTimer: (timer: Partial<TimerSlice['sleepTimer']>) => void;
  startSleepTimer: () => void;
  pauseSleepTimer: () => void;
  resumeSleepTimer: () => void;
  resetSleepTimer: (shouldResetToDefault: boolean) => void;
  setSleepTimerDuration: (minutes: number, forSoundId?: SoundId) => void;
  // decrementTimer removed - TimerOrchestrator now drives timer state directly
  setSoundTimer: (timer: SoundTimer | null) => void;
}

/**
 * Timer Slice - Time Management domain.
 * This slice handles sleep timer and individual sound timers, including countdown logic and timer controls.
 * 
 * Pattern: StateCreator<StoreState, [], [], TimerSlice>
 */
export const createTimerSlice: StateCreator<StoreState, [], [], TimerSlice> = (set, get) => ({
  // State
  sleepTimer: {
    timeLeft: 0,
    totalTime: 15 * 60,
    isRunning: false,
    selectedTime: 15 * 60,
    soundDefaults: {},
  },
  soundTimer: null,

  // Actions
  setSleepTimer: (timer) => set((state) => ({ sleepTimer: { ...state.sleepTimer, ...timer } })),

  startSleepTimer: () =>
    set((state) => {
      const timeLeft = state.sleepTimer.timeLeft > 0 ? state.sleepTimer.timeLeft : state.sleepTimer.selectedTime;
      void state.timerOrchestrator?.start(Duration.fromNow(timeLeft), state.sleepTimer.selectedTime);
      return {
        sleepTimer: {
          ...state.sleepTimer,
          isRunning: true,
          timeLeft,
          totalTime: state.sleepTimer.timeLeft > 0 ? state.sleepTimer.totalTime : state.sleepTimer.selectedTime,
        },
      };
    }),

  pauseSleepTimer: () =>
    set((state) => {
      // Use target-shifting pause instead of stop to preserve remaining time
      void state.timerOrchestrator?.pause();
      return { sleepTimer: { ...state.sleepTimer, isRunning: false } };
    }),

  resumeSleepTimer: () =>
    set((state) => {
      const timeLeft = state.sleepTimer.timeLeft > 0 ? state.sleepTimer.timeLeft : state.sleepTimer.selectedTime;
      // Use target-shifting resume to preserve remaining time
      void state.timerOrchestrator?.resume();
      return {
        sleepTimer: {
          ...state.sleepTimer,
          isRunning: true,
          timeLeft,
          totalTime: state.sleepTimer.timeLeft > 0 ? state.sleepTimer.totalTime : state.sleepTimer.selectedTime,
        },
      };
    }),

  resetSleepTimer: (shouldResetToDefault) =>
    set((state) => {
      void state.timerOrchestrator?.stop();
      const tracks = state.mixEntity?.tracks ?? [];
      const soundIds = tracks.map((track) => track.id);
      const defaultTime = shouldResetToDefault ? getMaxTimerForSounds(soundIds, state.sleepTimer.soundDefaults) : 15 * 60;
      return {
        sleepTimer: {
          ...state.sleepTimer,
          timeLeft: defaultTime,
          totalTime: defaultTime,
          isRunning: tracks.length > 0,
          selectedTime: defaultTime,
        },
      };
    }),

  setSleepTimerDuration: (seconds, forSoundId) =>
    set((state) => {
      const newDefaults = { ...state.sleepTimer.soundDefaults };
      if (forSoundId) {
        newDefaults[forSoundId] = seconds;
      } else {
        const tracks = state.mixEntity?.tracks ?? [];
        tracks.forEach((track) => { newDefaults[track.id] = seconds; });
      }

      // Auto-start: if we are currently playing, setting a non-zero timer should start it immediately.
      const trackCount = state.mixEntity?.tracks.length ?? 0;
      const shouldStart = trackCount > 0 && !state.isPaused && seconds > 0;

      if (shouldStart && seconds > 0) {
        void state.timerOrchestrator?.start(Duration.fromNow(seconds), seconds);
      } else if (seconds === 0) {
        void state.timerOrchestrator?.stop();
      }

      return {
        sleepTimer: {
          ...state.sleepTimer,
          timeLeft: seconds,
          totalTime: seconds,
          selectedTime: seconds,
          isRunning: shouldStart,
          soundDefaults: newDefaults,
        },
      };
    }),

  setSoundTimer: (timer) => set({ soundTimer: timer }),
});
