'use client';

import React, { useCallback } from 'react';
import { OnboardingSound } from '@/types/onboarding';
import { useAccessibility } from '@/contexts/accessibility-context';
import { getCardSizeConfig } from '@/lib/accessibility/card-sizes';

interface OnboardingSoundCardProps {
  sound: OnboardingSound;
  isActive: boolean;
  onToggle: (soundId: string) => void;
  showPulse?: boolean;
  compact?: boolean;
}

export const OnboardingSoundCard: React.FC<OnboardingSoundCardProps> = ({
  sound,
  isActive,
  onToggle,
  showPulse = false,
  compact = false,
}) => {
  const { cardSize } = useAccessibility();
  // Use compact config for onboarding, otherwise use accessibility preference
  const config = compact ? {
    containerClass: 'h-20',
    iconSize: 'text-lg',
    titleSize: 'text-xs',
    padding: 'p-2',
  } : getCardSizeConfig(cardSize);

  const handleClick = useCallback(() => {
    onToggle(sound.id);
  }, [sound.id, onToggle]);

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        className={`relative w-full ${config.containerClass} rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
          isActive
            ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/50'
            : 'ring-1 ring-white/10 hover:ring-white/30'
        } ${showPulse ? 'animate-pulse-ring' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        aria-label={`${sound.name}${isActive ? ' - Playing' : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={sound.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${config.padding}`}>
          <span className={`${config.iconSize} mb-2 drop-shadow-lg`}>{sound.icon}</span>
          <span
            className={`text-white ${config.titleSize} font-semibold text-center drop-shadow-lg leading-tight text-clamp-2 wrap-break-word px-1`}
          >
            {sound.name}
          </span>
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute inset-0 bg-purple-500/10 pointer-events-none" />
        )}

        {/* Playing indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <div className="w-1 h-3 bg-white animate-sound-wave" style={{ animationDelay: '0s' }} />
            <div className="w-1 h-4 bg-white animate-sound-wave" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-3 bg-white animate-sound-wave" style={{ animationDelay: '0.2s' }} />
          </div>
        )}
      </div>
    </div>
  );
};
