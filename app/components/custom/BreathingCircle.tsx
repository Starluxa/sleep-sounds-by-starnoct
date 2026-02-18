'use client'

import { BREATHE_UI_CONFIG } from './breathing-ui-config'
import type { BreathePhase } from '@/core/wellness/breathing/BreathingTypes'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface BreathingCircleProps {
  phase: BreathePhase
  isActive: boolean
  timeLeft: number
  toggle: () => void
}

const BreathingCircle = ({ phase, isActive, timeLeft, toggle }: BreathingCircleProps) => {
  const config = BREATHE_UI_CONFIG[phase]

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    mq.addEventListener('change', handleChange);

    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const phaseOpacities: Record<BreathePhase, number> = {
    idle: 0.2,
    inhale: 0.3,
    hold: 0.6,
    exhale: 1.0,
  };

  const opacity = reducedMotion ? phaseOpacities[phase] ?? 1 : 1;

  const bubbleBg = phase === 'idle'
    ? 'bg-white/10' 
    : phase === 'inhale' 
      ? 'bg-sky-500/30' 
      : phase === 'hold' 
        ? 'bg-purple-500/30' 
        : 'bg-indigo-500/30'

  const instructionText = !isActive && phase === 'idle'
    ? 'Tap the button to begin your 4-7-8 breathing exercise' 
    : ''

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-4 sm:p-8 space-y-8">
      {/* Circle Container */}
      <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 mx-auto">
        {/* Outer Glow */}
        <div 
          className="absolute w-64 h-64 sm:w-72 sm:h-72 bg-sky-900/20 blur-3xl animate-pulse-slow rounded-full z-0 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        {/* Bubble */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full backdrop-blur-md border-2 border-white/10 shadow-2xl transition-all ease-in-out will-change-transform',
            bubbleBg
          )}
          style={{
            transform: reducedMotion 
              ? 'scale(1)' 
              : phase === 'inhale'
                ? 'scale(calc(1 + var(--breath-progress, 0) * 0.5))'
                : phase === 'exhale'
                  ? 'scale(calc(1.5 - var(--breath-progress, 0) * 0.5))'
                  : phase === 'hold'
                    ? 'scale(1.5)'
                    : 'scale(1)',
            opacity,
          } as React.CSSProperties}
        />
        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 py-6 sm:px-8 sm:py-8 pointer-events-none">
          <div className={cn('text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg text-center leading-tight', config.color)}>
            {config.label}
          </div>
          {phase !== 'idle' && (
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-wider mt-2 opacity-90 drop-shadow-sm text-white">
              {timeLeft}
            </div>
          )}
        </div>
      </div>

      {/* Idle Instruction */}
      {instructionText && (
        <p className="text-center text-lg sm:text-xl text-white/80 max-w-md leading-relaxed px-4">
          {instructionText}
        </p>
      )}

      {/* Controls */}
      <Button
        size="lg"
        className={cn(
          'h-16 w-16 rounded-full p-0 shadow-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/30 hover:shadow-3xl active:scale-[0.95] transition-all duration-200'
        )}
        onClick={toggle}
        aria-label={isActive ? 'Pause breathing exercise' : 'Start breathing exercise'}
      >
        {isActive ? (
          <Pause className="h-8 w-8 fill-current text-white" />
        ) : (
          <Play className="h-8 w-8 ml-1 fill-current text-white" />
        )}
      </Button>
    </div>
  )
}

export default BreathingCircle