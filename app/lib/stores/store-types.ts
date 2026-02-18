/**
 * Central Store Types
 * 
 * This file defines the complete StoreState interface that all slices can reference.
 * This eliminates circular import issues and provides type-safe cross-slice access.
 * 
 * Pattern: StateCreator<StoreState, [], [], SliceInterface>
 */

import { SoundTimer, AudioSettings } from '@/types/sounds';
import { SoundId } from '../../../src/domain/sounds/dtos/SoundState';
import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';
import { IAudioPort } from '../../core/audio/IAudioPort';
import { SyncMixUseCase } from '../../application/audio/SyncMixUseCase';
import { TimerOrchestrator } from '../../../src/application/timer';

/**
 * Complete store state interface combining all slices.
 * Each slice can access this via get() without type casting.
 */
export interface StoreState {
  // Audio Slice State
  audioLoading: { [key: SoundId]: boolean };
  audioErrors: { [key: SoundId]: string };
  showLimitDialog: boolean;
  hasUserGesture: boolean;
  autoplayBlocked: boolean;
  audioEngine: 'web' | 'native';
  currentMixKey?: string;
  mixEntity: MixEntity | null;
  audioPort: IAudioPort | null;
  syncMixUseCase: SyncMixUseCase | null;
  timerOrchestrator: TimerOrchestrator | null;

  // Timer Slice State
  soundTimer: SoundTimer | null;
  sleepTimer: {
    timeLeft: number;
    totalTime: number;
    isRunning: boolean;
    selectedTime: number;
    soundDefaults: { [soundId: SoundId]: number };
  };

  // UI Slice State
  audioSettings: AudioSettings;
  transientVolume: number;
  isPaused: boolean;

  // Audio Slice Actions
  setShowLimitDialog: (show: boolean) => void;
  setAudioEngine: (engine: 'web' | 'native') => void;
  addSound: (soundId: SoundId) => void;
  removeSound: (soundId: SoundId) => void;
  updateVolume: (soundId: SoundId, volume: number) => void;
  setAudioLoading: (soundId: SoundId, isLoading: boolean) => void;
  setAudioError: (soundId: SoundId, errorMsg: string | null) => void;
  togglePausePlay: () => void;
  setHasUserGesture: (has: boolean) => void;
  setAutoplayBlocked: (blocked: boolean) => void;
  setMix: (mix: MixEntity | import('@/types/sounds').ActiveSound[]) => void;
  initializeMixEntity: () => void;

  // Timer Slice Actions
  setSleepTimer: (timer: Partial<StoreState['sleepTimer']>) => void;
  startSleepTimer: () => void;
  pauseSleepTimer: () => void;
  resumeSleepTimer: () => void;
  resetSleepTimer: (shouldResetToDefault: boolean) => void;
  setSleepTimerDuration: (minutes: number, forSoundId?: SoundId) => void;
  setSoundTimer: (timer: SoundTimer | null) => void;

  // UI Slice Actions
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  commitVolume: () => void;
}
