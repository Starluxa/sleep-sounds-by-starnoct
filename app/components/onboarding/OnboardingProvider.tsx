'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useOnboardingStore } from '@/lib/onboarding-store';
import { Volume } from '@/../src/domain/audio/Volume';

interface OnboardingContextType {
  // Audio state for demo sounds
  demoAudioRefs: React.MutableRefObject<{ [key: string]: HTMLAudioElement | null }>;
  playDemoSound: (soundId: string, volume?: number) => void;
  pauseDemoSound: (soundId: string) => void;
  stopAllDemoSounds: () => void;
  updateDemoVolume: (soundId: string, volume: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const demoAudioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const { clearDemoSounds } = useOnboardingStore();

  const playDemoSound = (soundId: string, volume: number = 0.5) => {
    const audio = demoAudioRefs.current[soundId];
    if (audio) {
      audio.volume = volume;
      audio.play().catch(() => {
        // Silent fail for demo sounds
      });
    }
  };

  const pauseDemoSound = (soundId: string) => {
    const audio = demoAudioRefs.current[soundId];
    if (audio) {
      audio.pause();
    }
  };

  const stopAllDemoSounds = () => {
    Object.values(demoAudioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  };

  const updateDemoVolume = (soundId: string, volume: number) => {
    const audio = demoAudioRefs.current[soundId];
    if (audio) {
      // Use domain physics for perceptual volume consistency
      audio.volume = Volume.create(volume).toLinear();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllDemoSounds();
      clearDemoSounds();
    };
  }, [clearDemoSounds]);

  return (
    <OnboardingContext.Provider
      value={{
        demoAudioRefs,
        playDemoSound,
        pauseDemoSound,
        stopAllDemoSounds,
        updateDemoVolume,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
}