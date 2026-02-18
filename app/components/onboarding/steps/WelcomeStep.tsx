'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MoonAnimation } from '../animations/MoonAnimation';
import { StarField } from '../animations/StarField';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, onSkip }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
      <h1 id="onboarding-title" className="sr-only">
        Welcome to StarNoct Sleep Sounds
      </h1>

      {/* Star field background */}
      <StarField density="low" />

      {/* Moon animation */}
      <div className="mb-8 relative z-10">
        <MoonAnimation />
      </div>

      {/* Headline */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white relative z-10">
        Counting sheep is so last year.
      </h2>

      {/* Body text */}
      <p className="text-gray-300 text-center max-w-md mb-8 text-lg relative z-10">
        Let's craft the perfect soundscape to help you drift off. No sheep required{' '}
        <span className="text-gray-400">(they're on strike anyway)</span>.
      </p>

      {/* CTA Button */}
      <button
        onClick={onNext}
        className="px-8 py-5 rounded-xl bg-gradient-to-br from-purple-600/90 to-purple-800/70 backdrop-blur-md border border-purple-400/50 text-white font-medium text-lg shadow-lg hover:from-purple-500/90 hover:to-purple-700/70 active:scale-95 transition-all relative z-20 animate-bounce-in pointer-events-auto"
        autoFocus
      >
        Let's Begin
      </button>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="mt-6 px-4 py-2 text-base text-white/80 hover:text-white bg-slate-800/60 hover:bg-slate-700/70 active:scale-95 rounded-lg border border-white/20 transition-all relative z-20 pointer-events-auto"
      >
        Skip
      </button>
    </div>
  );
};