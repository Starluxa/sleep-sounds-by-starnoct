'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { StarField } from '../animations/StarField';

interface LimitsStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const LimitsStep: React.FC<LimitsStepProps> = ({ onNext, onSkip }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Star field background */}
      <StarField density="low" />
      
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 p-4">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <div className="h-1 flex-1 bg-purple-500 rounded" />
          <div className="h-1 flex-1 bg-purple-500 rounded" />
          <div className="h-1 flex-1 bg-gray-700 rounded" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-white">
        You're a natural sound artist!
      </h2>

      {/* Visual limit representation */}
      <div className="flex flex-wrap gap-2 my-8 justify-center">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
          <div
            key={i}
            className="w-14 h-14 rounded-full bg-sky-500/30 flex items-center justify-center border-2 border-sky-400 animate-pulse-glow"
          >
            <span className="text-2xl">🎵</span>
          </div>
        ))}
      </div>

      {/* Body text */}
      <p className="text-gray-300 text-center max-w-lg mb-8 text-lg">
        Mix up to <span className="text-sky-400 font-semibold">10 sounds</span> at once. Create epic{' '}
        <span className="text-purple-400 font-semibold">10-sound symphonies</span> and enjoy our full library{' '}
        <span className="text-pink-400">
          (we even have a whale. Seriously, a singing whale.)
        </span>
      </p>

      {/* CTA Button */}
      <button
        onClick={onNext}
        className="px-8 py-5 rounded-xl bg-gradient-to-br from-purple-600/90 to-purple-800/70 backdrop-blur-md border border-purple-400/50 text-white font-medium text-lg shadow-lg hover:from-purple-500/90 hover:to-purple-700/70 active:scale-95 transition-all relative z-20 animate-bounce-in pointer-events-auto"
      >
        Cool, Got It!
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