'use client';

import React, { useEffect, useRef } from 'react';

export const TimerAnimation: React.FC = () => {
  const circleRef = useRef<SVGCircleElement>(null);
  const zzzRef = useRef<HTMLDivElement>(null);
  const circumference = 2 * Math.PI * 45;

  useEffect(() => {
    let rafId: number;
    const startTime = performance.now();
    const duration = 2500; // 2.5 seconds for a full cycle (matching the old 50ms * 50 steps)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;
      const percent = progress * 100;
      const offset = circumference - progress * circumference;

      if (circleRef.current) {
        circleRef.current.setAttribute('stroke-dashoffset', offset.toString());
      }

      if (zzzRef.current) {
        zzzRef.current.style.opacity = percent > 90 ? '1' : '0';
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [circumference]);

  return (
    <div className="w-32 h-32 mx-auto relative">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-slate-700/40"
        />

        {/* Animated progress circle */}
        <circle
          ref={circleRef}
          cx="50"
          cy="50"
          r="45"
          stroke="url(#timerGradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className="transition-none"
        />
      </svg>

      {/* Zzz text - appears when timer is full */}
      <div
        ref={zzzRef}
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0"
      >
        <span className="text-3xl font-bold text-white animate-fade-in">
          Zzz
        </span>
      </div>
    </div>
  );
};