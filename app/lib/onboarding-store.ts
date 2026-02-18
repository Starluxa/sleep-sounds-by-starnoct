import { create } from 'zustand';
import { 
  OnboardingState, 
  OnboardingData, 
  ONBOARDING_VERSION, 
  ONBOARDING_STORAGE_KEY 
} from '@/types/onboarding';

interface OnboardingStore extends OnboardingState {
  // Actions
  setIsActive: (isActive: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  addDemoSound: (soundId: string) => void;
  removeDemoSound: (soundId: string) => void;
  clearDemoSounds: () => void;
  setCurrentInstruction: (instruction: string | null) => void;
  nextInstruction: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  reset: () => void;
}

const initialState: OnboardingState = {
  isActive: false,
  currentStep: 1,
  totalSteps: 4,
  activeDemoSounds: [],
  isComplete: false,
  hasSkipped: false,
  currentInstruction: null,
  instructionStep: 0,
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,

  setIsActive: (isActive) => set({ isActive }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      currentInstruction: null,
      instructionStep: 0,
    })),

  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
      currentInstruction: null,
      instructionStep: 0,
    })),

  goToStep: (step) =>
    set({
      currentStep: Math.max(1, Math.min(step, get().totalSteps)),
      currentInstruction: null,
      instructionStep: 0,
    }),

  addDemoSound: (soundId) =>
    set((state) => ({
      activeDemoSounds: state.activeDemoSounds.includes(soundId)
        ? state.activeDemoSounds
        : [...state.activeDemoSounds, soundId],
    })),

  removeDemoSound: (soundId) =>
    set((state) => ({
      activeDemoSounds: state.activeDemoSounds.filter((id) => id !== soundId),
    })),

  clearDemoSounds: () => set({ activeDemoSounds: [] }),

  setCurrentInstruction: (instruction) =>
    set({ currentInstruction: instruction }),

  nextInstruction: () =>
    set((state) => ({
      instructionStep: state.instructionStep + 1,
    })),

  completeOnboarding: () => {
    const data: OnboardingData = {
      completed: true,
      completedAt: new Date().toISOString(),
      skipped: false,
      stepsCompleted: [1, 2, 3, 4],
      version: ONBOARDING_VERSION,
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    }
    
    set({
      isActive: false,
      isComplete: true,
      activeDemoSounds: [],
    });
  },

  skipOnboarding: () => {
    const state = get();
    const data: OnboardingData = {
      completed: true,
      completedAt: new Date().toISOString(),
      skipped: true,
      stepsCompleted: [state.currentStep],
      version: ONBOARDING_VERSION,
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    }
    
    set({
      isActive: false,
      hasSkipped: true,
      activeDemoSounds: [],
    });
  },

  reset: () => set(initialState),
}));

// Helper functions for localStorage operations
export function getOnboardingData(): OnboardingData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading onboarding data:', error);
    return null;
  }
}

export function shouldShowOnboarding(): boolean {
  const data = getOnboardingData();
  
  // Show if never completed or version changed
  return !data || !data.completed || data.version !== ONBOARDING_VERSION;
}

export function clearOnboardingData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}