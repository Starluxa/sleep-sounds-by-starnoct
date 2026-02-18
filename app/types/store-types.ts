import type { ActiveSound, SoundTimer, AudioSettings } from './sounds';
import type { SoundId } from '../../src/domain/sounds/dtos/SoundState';

export interface AudioState {
  loading: boolean;
  error: string | null;
  audioLoading: { [key: SoundId]: boolean };
  audioErrors: { [key: SoundId]: string };
  soundTimer: SoundTimer | null;
  sleepTimer: {
    timeLeft: number;
    totalTime: number;
    isRunning: boolean;
    selectedTime: number;
    soundDefaults: { [soundId: SoundId]: number };
  };
  audioSettings: AudioSettings;
  isPaused: boolean;
  currentMixKey?: string;
  addSound: (soundId: SoundId) => void;
  removeSound: (soundId: SoundId) => void;
  updateVolume: (soundId: SoundId, volume: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAudioLoading: (soundId: SoundId, isLoading: boolean) => void;
  setAudioError: (soundId: SoundId, errorMsg: string | null) => void;
  setSleepTimer: (timer: Partial<AudioState['sleepTimer']>) => void;
  startSleepTimer: () => void;
  pauseSleepTimer: () => void;
  resetSleepTimer: (shouldResetToDefault: boolean) => void;
  setSleepTimerDuration: (minutes: number, forSoundId?: SoundId) => void;
  updateSleepTimer: (minutes: number) => void;
  setSoundTimer: (timer: SoundTimer | null) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  // decrementTimer removed - TimerOrchestrator now drives timer state directly
  togglePausePlay: () => void;
}