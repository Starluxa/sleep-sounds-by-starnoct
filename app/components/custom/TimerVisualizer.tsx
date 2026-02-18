'use client';

import { formatTimerDisplay } from "@/lib/utils";
import { useAtomicTimer } from "@/hooks/useAtomicTimer";

interface TimerVisualizerProps {
  totalTime: number;
  timeLeft: number;
  progress?: number;
  isRunning: boolean;
  isPaused: boolean;
  onToggle: () => void;
  className?: string;
}

export function TimerVisualizer({ 
  className, 
  isPaused: _isPaused,
  onToggle,
  totalTime: propTotalTime,
  timeLeft: propTimeLeft,
  progress: propProgress,
  isRunning: propIsRunning
}: TimerVisualizerProps) {
  // Use atomic timer for remaining time display (single source of truth)
  const { timeLeft: atomicTimeLeft, progress: atomicProgress, isRunning: atomicIsRunning } = useAtomicTimer();
  
  // Prefer atomic timer values if available, otherwise fall back to props
  const displayTimeLeft = atomicTimeLeft > 0 ? atomicTimeLeft : propTimeLeft;
  const displayProgress = atomicProgress > 0 ? atomicProgress : propProgress;
  const displayIsRunning = atomicIsRunning || propIsRunning;
  const effectiveTotalTime = propTotalTime;
  
  const calculatedProgress = effectiveTotalTime === 0 ? 1 : effectiveTotalTime > 0 ? ((effectiveTotalTime - displayTimeLeft) / effectiveTotalTime) : 0;
  const effectiveProgress = displayProgress !== undefined ? displayProgress : calculatedProgress;

  return (
    <div
      className={`w-80 h-80 mx-auto relative cursor-pointer ${className || ''}`}
      onClick={onToggle}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="currentColor"
          className="text-slate-900/60"
        />
        {/* Animated progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#timerGradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - effectiveProgress)}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-1">
            {effectiveTotalTime === 0 ? '∞' : formatTimerDisplay(displayTimeLeft)}
          </div>
          {effectiveTotalTime === 0 ? (
            <div className="text-sm text-muted-foreground">No Timer</div>
          ) : !displayIsRunning && displayTimeLeft > 0 ? (
            <div className="text-sm text-muted-foreground">Paused</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}