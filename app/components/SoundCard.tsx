'use client';

import React, { useCallback, memo } from 'react'
import { Sound } from "@/types/sounds";
import { SoundCardImage } from "@/components/ui/OptimizedImage";
import { useAccessibility } from '@/contexts/accessibility-context';
import { getCardSizeConfig } from '@/lib/accessibility/card-sizes';

interface SoundCardProps {
  sound: Sound;
  isActive: boolean;
  onToggle: (soundId: string) => void;
  isFirstSound?: boolean;
}

const SoundCard = ({ sound, isActive, onToggle, isFirstSound }: SoundCardProps) => {
  const { cardSize } = useAccessibility();
  const config = getCardSizeConfig(cardSize);
  
  const handleClick = useCallback(() => {
    onToggle(sound.id);
  }, [sound.id, onToggle]);

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        className={`relative w-full ${config.containerClass} rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
          isActive ? "ring-2 ring-purple-500" : "ring-1 ring-white/10 hover:ring-white/30"
        }`}
      >
        <SoundCardImage
          src={`/images/sounds/${sound.image.split('/').pop()?.replace(/\s/g, '-').replace(/\.[^/.]+$/, '') || sound.id}.webp`}
          alt={sound.name}
          className="absolute inset-0 w-full h-full"
          priority={isFirstSound}
        />

        <div className="absolute inset-0 bg-black/10" />

        <div className={`absolute inset-0 flex flex-col items-center justify-center ${config.padding}`}>
          <span className={`${config.iconSize} mb-2 drop-shadow-lg`}>{sound.icon}</span>
          <span
            className={`text-white ${config.titleSize} font-semibold text-center drop-shadow-lg leading-tight text-clamp-2 wrap-break-word px-1`}
          >
            {sound.name}
          </span>
        </div>

        {isActive && (
          <div className="absolute inset-0 bg-purple-500/10 pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default memo(SoundCard);
