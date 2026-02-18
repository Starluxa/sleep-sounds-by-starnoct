'use client';

import React, { FC, useRef, useEffect } from 'react';
import { useSaveViewModel } from '../../../hooks/useSaveViewModel';
import { SAVE_GEOMETRY } from '../../../core/onboarding/save-animation/SaveGeometry';

export const SaveAnimation: FC = () => {
  const { policy, reducedMotion, uniqueId } = useSaveViewModel();

  const heartGradientId = `${uniqueId}-heartGradient`;
  const sparkleGradientId = `${uniqueId}-sparkleGradient`;
  const ringGradientId = `${uniqueId}-ringGradient`;
  const glowFilterId = `${uniqueId}-glowFilter`;

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const el = svgRef.current;

    if (reducedMotion) {
      const state = policy.computeFrame(0);
      el.style.setProperty('--heart-scale', state.heart.scale.toFixed(4));
      el.style.setProperty('--heart-opacity', state.heart.opacity.toFixed(4));
      el.style.setProperty('--outer-ring-scale', state.outerRing.scale.toFixed(4));
      el.style.setProperty('--outer-ring-opacity', state.outerRing.opacity.toFixed(4));
      el.style.setProperty('--middle-ring-scale', state.middleRing.scale.toFixed(4));
      el.style.setProperty('--middle-ring-opacity', state.middleRing.opacity.toFixed(4));
      
      state.sparkles.forEach((s, i) => {
        el.style.setProperty(`--sparkle-${i}-scale`, s.scale.toFixed(4));
        el.style.setProperty(`--sparkle-${i}-opacity`, s.opacity.toFixed(4));
        el.style.setProperty(`--sparkle-${i}-rotation`, `${s.rotation.toFixed(2)}deg`);
      });
      return;
    }

    let rafId: number | null = null;

    const animate = (timestamp: number) => {
      const state = policy.computeFrame(timestamp);

      el.style.setProperty('--heart-scale', state.heart.scale.toFixed(4));
      el.style.setProperty('--heart-opacity', state.heart.opacity.toFixed(4));
      el.style.setProperty('--outer-ring-scale', state.outerRing.scale.toFixed(4));
      el.style.setProperty('--outer-ring-opacity', state.outerRing.opacity.toFixed(4));
      el.style.setProperty('--middle-ring-scale', state.middleRing.scale.toFixed(4));
      el.style.setProperty('--middle-ring-opacity', state.middleRing.opacity.toFixed(4));

      el.style.setProperty('--sparkle-0-scale', state.sparkles[0].scale.toFixed(4));
      el.style.setProperty('--sparkle-0-opacity', state.sparkles[0].opacity.toFixed(4));
      el.style.setProperty('--sparkle-0-rotation', `${state.sparkles[0].rotation.toFixed(2)}deg`);
      el.style.setProperty('--sparkle-1-scale', state.sparkles[1].scale.toFixed(4));
      el.style.setProperty('--sparkle-1-opacity', state.sparkles[1].opacity.toFixed(4));
      el.style.setProperty('--sparkle-1-rotation', `${state.sparkles[1].rotation.toFixed(2)}deg`);
      el.style.setProperty('--sparkle-2-scale', state.sparkles[2].scale.toFixed(4));
      el.style.setProperty('--sparkle-2-opacity', state.sparkles[2].opacity.toFixed(4));
      el.style.setProperty('--sparkle-2-rotation', `${state.sparkles[2].rotation.toFixed(2)}deg`);

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      svgRef.current = null;
    };
  }, [policy, reducedMotion]);

  return (
    <svg
      ref={svgRef}
      id={uniqueId}
      className="save-animation w-32 h-32 mx-auto text-pink-500"
      viewBox="0 0 128 128"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={heartGradientId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="40%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id={sparkleGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ringGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="white" floodOpacity="0.4" />
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="currentColor" floodOpacity="0.8" />
        </filter>
      </defs>
      <circle id="outer-ring" cx="64" cy="64" r="48" />
      <circle id="middle-ring" cx="64" cy="64" r="40" />
      
      {/* Heart Group: Outer g handles positioning, inner #heart-g handles animation */}
      <g transform="translate(64, 64)">
        <g id="heart-g" filter={`url(#${glowFilterId})`}>
          <path
            d={SAVE_GEOMETRY.heart.pathD}
            transform="scale(2.6666666666666665) translate(-12, -12)"
            fill={`url(#${heartGradientId})`}
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
        </g>
      </g>

      {/* Sparkle Groups: Outer g handles positioning, inner .sparkle handles animation */}
      {SAVE_GEOMETRY.sparkles.map((geo, i) => (
        <g
          key={i}
          transform={`translate(${geo.position[0] * 128}, ${geo.position[1] * 128})`}
        >
          <g
            className={`sparkle sparkle-${i} text-pink-${i === 0 ? '300' : i === 1 ? '400' : '200'}`}
          >
            <path
              d={SAVE_GEOMETRY.sparkle.pathD}
              transform={`scale(${geo.baseScale * 128 / 20}) translate(-10, -10)`}
              fill="currentColor"
            />
          </g>
        </g>
      ))}
    </svg>
  );
};