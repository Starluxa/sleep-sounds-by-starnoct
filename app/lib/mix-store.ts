import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ActiveSound, LocalSavedMix } from '@/types/sounds';
import { toast } from '@/hooks/use-toast';

interface MixState {
  savedMixes: LocalSavedMix[];
  loading: boolean;
  error: string | null;
  initializeMixes: () => void;
  addMix: (newMix: Omit<LocalSavedMix, 'id' | 'createdAt'>) => Promise<void>;
  deleteMix: (mixId: string) => Promise<void>;
  saveCurrentMix: (name: string, sounds: ActiveSound[]) => Promise<void>;
}

type PersistentState = Pick<MixState, 'savedMixes' | 'loading' | 'error'>;

export const useMixStore = create<MixState>()(
  persist(
    (set, get) => ({
      savedMixes: [],
      loading: false,
      error: null,
      
      // 1. Initialize from localStorage on load
      initializeMixes: () => {
        const state = get();
      },

      // 2. Save Current Mix: Wrapper around addMix for convenience
      saveCurrentMix: async (name: string, sounds: ActiveSound[]) => {
        set({ loading: true, error: null });
        try {
          await get().addMix({ name, sounds });
          set({ loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save mix';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },


      // 3. Add Mix: Update UI instantly
      addMix: async (newMixData: Omit<LocalSavedMix, 'id' | 'createdAt'>) => {
        const tempId = crypto.randomUUID();
        const mixWithTempId: LocalSavedMix = {
          ...newMixData,
          id: tempId,
          createdAt: Date.now(),
        };

        // Instant UI update
        set((state: MixState) => ({ savedMixes: [...state.savedMixes, mixWithTempId] }));
        toast({ title: 'Mix saved!' });
      },

      // 4. Delete Mix: Update UI instantly
      deleteMix: async (mixId) => {
        // Instant UI update
        set((state: MixState) => ({ savedMixes: state.savedMixes.filter((m: LocalSavedMix) => m.id !== mixId) }));
        toast({ title: 'Mix deleted.' });
      },
    }),
    {
      name: 'starnoct-saved-mixes',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistentState => ({
        savedMixes: state.savedMixes,
        loading: state.loading,
        error: state.error,
      }),
      onRehydrateStorage: (state) => {
        return (hydratedState, error) => {
          if (error) {
            console.error('hydration error', error);
          } else if (hydratedState?.savedMixes?.length === 0) {
          }
        };
      },
    }
  )
);