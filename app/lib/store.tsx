import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAudioSlice, AudioSlice } from './stores/audio-slice';
import { createTimerSlice, TimerSlice } from './stores/timer-slice';
import { createUiSlice, UiSlice } from './stores/ui-slice';
import { MixEntity } from '../../src/domain/sounds/entities/MixEntity';
import { mapMixToActiveSounds } from '@/application/audio/mappers';
import type { ActiveSound } from '@/types/sounds';

// SCORCHED-EARTH: Nuclear Reset for Development Stability
const CURRENT_VERSION = '2026-02-07-v1'; // Update this to force a total reset
if (typeof window !== 'undefined') {
  if (localStorage.getItem('LUX_VERSION') !== CURRENT_VERSION) {
    localStorage.clear();
    localStorage.setItem('LUX_VERSION', CURRENT_VERSION);
  }
}

// Timer persistence keys
const TIMER_PERSISTENCE_KEY = 'sleep-timer-settings';

/**
 * StoreState combines all slice interfaces.
 * Centralized type definition for type-safe cross-slice access.
 */
export interface StoreState extends AudioSlice, TimerSlice, UiSlice {}

const EMPTY_ACTIVE_SOUNDS: ActiveSound[] = [];
const activeSoundsCache = new WeakMap<MixEntity, ActiveSound[]>();

export const selectActiveSounds = (state: StoreState): ActiveSound[] => {
  const mix = state.mixEntity;
  if (!mix) return EMPTY_ACTIVE_SOUNDS;

  const cached = activeSoundsCache.get(mix);
  if (cached) return cached;

  const mapped = mapMixToActiveSounds(mix);
  activeSoundsCache.set(mix, mapped);
  return mapped;
};

export const useAudioStore = create<StoreState>()(
  persist(
    (set, get, store) => ({
      // All slices now use StateCreator<StoreState, [], [], SliceInterface> pattern
      // This provides type-safe cross-slice access without casting
      ...createAudioSlice(set, get, store),
      ...createTimerSlice(set, get, store),
      ...createUiSlice(set, get, store),
    }),
    {
      name: TIMER_PERSISTENCE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state: StoreState) => ({
        sleepTimer: {
          ...state.sleepTimer,
          isRunning: false,
        },
        // Persist MixEntity DTO instead of activeSounds
        mixEntity: state.mixEntity ? state.mixEntity.toDTO() : null,
        audioSettings: state.audioSettings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.mixEntity && !(state.mixEntity instanceof MixEntity)) {
          // Convert DTO back to Entity
          try {
            state.mixEntity = MixEntity.fromDTO(state.mixEntity as ReturnType<MixEntity['toDTO']>);
          } catch (e) {
            state.mixEntity = null;
          }
        }
      }
    }
  )
);
