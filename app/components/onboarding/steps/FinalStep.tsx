'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { TimerAnimation } from '../animations/TimerAnimation';
import { SaveAnimation } from '../animations/SaveAnimation';
import { StarField } from '../animations/StarField';

interface FinalStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const FinalStep: React.FC<FinalStepProps> = ({ onComplete, onSkip }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Star field background */}
      <StarField density="low" />
      
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 p-4">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <div className="h-1 flex-1 bg-purple-500 rounded" />
          <div className="h-1 flex-1 bg-purple-500 rounded" />
          <div className="h-1 flex-1 bg-purple-500 rounded" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-center mb-12 text-white">
        Just two more things...
      </h2>

      {/* Feature grid */}
      <div className="grid md:grid-cols-2 gap-12 max-w-3xl w-full mb-12">
        {/* Timer section */}
        <div className="flex flex-col items-center text-center">
          <TimerAnimation />
          <p className="text-gray-300 mt-6 text-base max-w-xs">
            Set a timer so we can tuck your sounds in for the night.
          </p>
        </div>

        {/* Saving section */}
        <div className="flex flex-col items-center text-center">
          <SaveAnimation />
          <p className="text-gray-300 mt-6 text-base max-w-xs">
            Found a mix you love? Save it to your library by creating a free account.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onComplete}
        className="px-12 py-5 rounded-xl bg-gradient-to-br from-purple-600/90 to-purple-800/70 backdrop-blur-md border border-purple-400/50 text-white font-semibold text-lg shadow-lg hover:from-purple-500/90 hover:to-purple-700/70 active:scale-95 transition-all relative z-20 animate-bounce-in pointer-events-auto"
      >
        Let's Go!
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