import { useEffect } from 'react';
import { useOnboardingStore, shouldShowOnboarding } from '@/lib/onboarding-store';

export function useOnboarding() {
  const store = useOnboardingStore();

  useEffect(() => {
    // Check for mix URL parameter - if present, skip onboarding since shared mix is the onboarding
    const hasMixParam = new URLSearchParams(window.location.search).get('mix') !== null;

    // Check if onboarding should be shown on mount
    if (shouldShowOnboarding() && !store.isActive && !store.isComplete && !hasMixParam) {
      // Small delay to ensure app is fully loaded
      const timer = setTimeout(() => {
        store.setIsActive(true); // Enable onboarding flow
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  return {
    isActive: store.isActive,
    currentStep: store.currentStep,
    totalSteps: store.totalSteps,
    activeDemoSounds: store.activeDemoSounds,
    isComplete: store.isComplete,
    hasSkipped: store.hasSkipped,
    currentInstruction: store.currentInstruction,
    instructionStep: store.instructionStep,
    setIsActive: store.setIsActive,
    nextStep: store.nextStep,
    previousStep: store.previousStep,
    goToStep: store.goToStep,
    addDemoSound: store.addDemoSound,
    removeDemoSound: store.removeDemoSound,
    clearDemoSounds: store.clearDemoSounds,
    setCurrentInstruction: store.setCurrentInstruction,
    nextInstruction: store.nextInstruction,
    completeOnboarding: store.completeOnboarding,
    skipOnboarding: store.skipOnboarding,
    reset: store.reset,
  };
}