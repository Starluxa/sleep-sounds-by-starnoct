'use client';

import React, { useCallback, useEffect } from 'react';
import { OnboardingOverlay } from './OnboardingOverlay';
import { OnboardingProvider } from './OnboardingProvider';
import { WelcomeStep } from './steps/WelcomeStep';
import { InteractiveMixStep } from './steps/InteractiveMixStep';
import { LimitsStep } from './steps/LimitsStep';
import { FinalStep } from './steps/FinalStep';
import { useAudioStore } from '@/lib/store';
import { ONBOARDING_SOUNDS } from '@/types/onboarding';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function OnboardingFlow() {
  // This hook automatically activates onboarding for first-time users
  const onboarding = useOnboarding();
  
  const {
    isActive,
    currentStep,
    nextStep,
    skipOnboarding,
    completeOnboarding,
    clearDemoSounds
  } = onboarding;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  const handleNext = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handleSkip = useCallback(() => {
    clearDemoSounds();
    ONBOARDING_SOUNDS.forEach(({ id }) => {
      useAudioStore.getState().removeSound(id);
    });
    skipOnboarding();
  }, [skipOnboarding, clearDemoSounds]);

  const handleComplete = useCallback(() => {
    clearDemoSounds();
    ONBOARDING_SOUNDS.forEach(({ id }) => {
      useAudioStore.getState().removeSound(id);
    });
    completeOnboarding();
  }, [completeOnboarding, clearDemoSounds]);

  if (!isActive) return null;

  return (
    <OnboardingProvider>
      <OnboardingOverlay>
        {currentStep === 1 && <WelcomeStep onNext={handleNext} onSkip={handleSkip} />}
        {currentStep === 2 && <InteractiveMixStep onNext={handleNext} onSkip={handleSkip} />}
        {currentStep === 3 && <LimitsStep onNext={handleNext} onSkip={handleSkip} />}
        {currentStep === 4 && <FinalStep onComplete={handleComplete} onSkip={handleSkip} />}
      </OnboardingOverlay>
    </OnboardingProvider>
  );
}