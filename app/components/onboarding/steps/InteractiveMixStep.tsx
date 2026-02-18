'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { OnboardingSoundCard } from '../OnboardingSoundCard';
import { ONBOARDING_SOUNDS, ONBOARDING_INSTRUCTIONS } from '@/types/onboarding';
import { useOnboardingStore } from '@/lib/onboarding-store';
import { useAudioStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { StarField } from '../animations/StarField';

interface InteractiveMixStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const InteractiveMixStep: React.FC<InteractiveMixStepProps> = ({ onNext, onSkip }) => {
  const activeDemoSounds = useOnboardingStore((state) => state.activeDemoSounds);
  const addDemoSound = useOnboardingStore((state) => state.addDemoSound);
  const removeDemoSound = useOnboardingStore((state) => state.removeDemoSound);
  const instructionStep = useOnboardingStore((state) => state.instructionStep);
  const nextInstruction = useOnboardingStore((state) => state.nextInstruction);
  const setCurrentInstruction = useOnboardingStore((state) => state.setCurrentInstruction);
  const currentInstruction = useOnboardingStore((state) => state.currentInstruction);

  const { addSound, removeSound, updateVolume } = useAudioStore();

  const [volumes, setVolumes] = useState<{ [key: string]: number }>({});
  const [showSliders, setShowSliders] = useState(false);


  // Set initial instruction
  useEffect(() => {
    if (instructionStep === 0) {
      setCurrentInstruction(ONBOARDING_INSTRUCTIONS[0].text);
    }
  }, [instructionStep, setCurrentInstruction]);

  // Handle sound toggle
  const handleSoundToggle = useCallback(
    (soundId: string) => {
      if (activeDemoSounds.includes(soundId)) {
        // Remove sound
        removeDemoSound(soundId);
        removeSound(soundId);
      } else {
        // Add sound
        addDemoSound(soundId);
        const initialVolume = volumes[soundId] || 50;
        setVolumes((prev) => ({ ...prev, [soundId]: initialVolume }));
        addSound(soundId);
        updateVolume(soundId, initialVolume);

        // Progress instructions
        if (instructionStep === 0) {
          // First sound selected
          nextInstruction();
          setTimeout(() => {
            setCurrentInstruction(ONBOARDING_INSTRUCTIONS[1].text);
          }, 500);
        } else if (instructionStep === 1 && activeDemoSounds.length >= 1) {
          // Second sound selected
          nextInstruction();
          setTimeout(() => {
            setCurrentInstruction(ONBOARDING_INSTRUCTIONS[2].text);
            setShowSliders(true);
          }, 500);
        }
      }
    },
    [
      activeDemoSounds,
      addDemoSound,
      removeDemoSound,
      volumes,
      instructionStep,
      nextInstruction,
      setCurrentInstruction,
    ]
  );

  // Handle volume change
  const handleVolumeChange = useCallback(
    (soundId: string, value: number[]) => {
      const volume = value[0];
      setVolumes((prev) => ({ ...prev, [soundId]: volume }));
      updateVolume(soundId, volume);
    },
    [updateVolume]
  );

  // Helper to check if sound should pulse
  const shouldHighlight = useCallback(
    (soundId: string) => {
      if (instructionStep === 0 && activeDemoSounds.length === 0) {
        return true; // Highlight all on first instruction
      }
      if (instructionStep === 1 && activeDemoSounds.length === 1 && !activeDemoSounds.includes(soundId)) {
        return true; // Highlight remaining sounds
      }
      return false;
    },
    [instructionStep, activeDemoSounds]
  );

  return (
    <div className="flex flex-col min-h-screen p-3 pb-24">
      {/* Star field background */}
      <StarField density="low" />
      
      {/* Header with progress and skip button */}
      <div className="flex items-center justify-between mb-3 pt-2">
        {/* Progress indicator */}
        <div className="flex gap-2 flex-1 max-w-xs">
          <div className="h-1 flex-1 bg-purple-500 rounded" />
          <div className="h-1 flex-1 bg-gray-700 rounded" />
          <div className="h-1 flex-1 bg-gray-700 rounded" />
        </div>
        
        {/* Skip button - now in flow, not absolute */}
        <button
          onClick={onSkip}
          className="ml-4 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-slate-800/60 hover:bg-slate-700/70 active:scale-95 rounded-lg border border-white/20 transition-all whitespace-nowrap relative z-20 pointer-events-auto"
        >
          Skip
        </button>
      </div>

      {/* Instruction text - static block at top */}
      {currentInstruction && (
        <div className="mx-4 mb-6 max-w-md self-center">
          <div className="bg-purple-600/95 backdrop-blur-md rounded-xl p-3 shadow-2xl">
            <p className="text-white text-center font-medium text-sm">
              {currentInstruction}
            </p>
          </div>
        </div>
      )}

      {/* Featured sounds grid */}
      <div className="flex-1 flex items-start justify-center mb-4">
        <div className="grid grid-cols-2 gap-3 max-w-2xl w-full px-1">
          {ONBOARDING_SOUNDS.map((sound) => (
            <OnboardingSoundCard
              key={sound.id}
              sound={sound}
              isActive={activeDemoSounds.includes(sound.id)}
              onToggle={handleSoundToggle}
              showPulse={shouldHighlight(sound.id)}
              compact={true}
            />
          ))}
        </div>
      </div>

      {/* Volume controls with Continue button */}
      {showSliders && activeDemoSounds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-800/95 backdrop-blur-md border-t border-slate-700 animate-slide-up z-40 pointer-events-auto">
          <div className="max-w-2xl mx-auto space-y-3">
            {activeDemoSounds.map((soundId) => {
              const sound = ONBOARDING_SOUNDS.find((s) => s.id === soundId);
              if (!sound) return null;

              return (
                <div key={soundId} className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-3">
                  <span className="text-xl">{sound.icon}</span>
                  <span className="text-sm flex-1 text-white">{sound.name}</span>
                  <div className="flex-1 max-w-xs pointer-events-auto touch-auto">
                    <Slider
                      value={[volumes[soundId] || 50]}
                      onValueChange={(value) => handleVolumeChange(soundId, value)}
                      max={100}
                      step={1}
                      className="w-full pointer-events-auto touch-auto"
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{volumes[soundId] || 50}%</span>
                  <button
                    onClick={() => handleSoundToggle(soundId)}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                    aria-label={`Remove ${sound.name}`}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              );
            })}
            
            {/* Continue button - positioned below volume sliders */}
            {activeDemoSounds.length >= 2 && (
              <div className="flex justify-center pt-2 animate-fade-in">
                <button
                  onClick={onNext}
                  className="px-8 py-4 rounded-xl bg-gradient-to-br from-purple-600/90 to-purple-800/70 backdrop-blur-md border border-purple-400/50 text-white font-medium shadow-lg hover:from-purple-500/90 hover:to-purple-700/70 active:scale-95 transition-all relative z-20 pointer-events-auto"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};