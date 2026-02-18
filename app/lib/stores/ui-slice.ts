// Global UI State
import { StateCreator } from 'zustand';
import { AudioSettings } from '@/types/sounds';

export interface UiSlice {
  audioSettings: AudioSettings;
  transientVolume: number;
  isPaused: boolean;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  commitVolume: () => void;
}

let commitTimeout: any = null;

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  audioSettings: {
    volume: 50,
    loop: true,
  },
  transientVolume: 50,
  isPaused: true,
  /**
   * Updates audio settings. If volume is provided, it updates transientVolume
   * and schedules a debounced commit to persistent settings.
   * @param settings - Partial audio settings to update.
   */
  updateAudioSettings: (settings) => {
    if ('volume' in settings && settings.volume !== undefined) {
      // Clamp volume to 0-100 range
      const clampedVolume = Math.min(100, Math.max(0, Math.round(settings.volume)));
      
      set({ transientVolume: clampedVolume });

      // Debounce the commit to persistent settings
      if (commitTimeout) clearTimeout(commitTimeout);
      commitTimeout = setTimeout(() => {
        get().commitVolume();
        commitTimeout = null;
      }, 300);
      
      return;
    }

    set((state) => ({
      audioSettings: { ...state.audioSettings, ...settings }
    }));
  },
  /**
   * Commits the transient volume to the persistent audio settings.
   */
  commitVolume: () => set((state) => ({
    audioSettings: { ...state.audioSettings, volume: state.transientVolume }
  })),
});