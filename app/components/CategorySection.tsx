'use client';

import { useState, useMemo } from 'react';
import SoundCard from './SoundCard';
import { Category, Sound } from '@/types/sounds';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/accessibility-context';
import { getGridColumns } from '@/lib/accessibility/card-sizes';

interface CategorySectionProps {
  id: string;
  category: Category;
  activeSoundIds: string[];
  onToggleSound: (soundId: string) => void;
  isFirstCategory: boolean;
}

const CategorySection = ({ id, category, activeSoundIds, onToggleSound, isFirstCategory }: CategorySectionProps) => {
  const { cardSize } = useAccessibility();
  const gridCols = getGridColumns(cardSize);
  
  const items = useMemo(() => category.sounds.map((sound: Sound, index: number) => (
    <SoundCard
      key={sound.id}
      sound={sound}
      isActive={activeSoundIds.includes(sound.id)}
      onToggle={onToggleSound}
      isFirstSound={isFirstCategory && index === 0}
    />
  )), [category.sounds, activeSoundIds, onToggleSound, isFirstCategory])

  return (
    <section id={id} className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
      <div className={`grid ${gridCols} gap-4`}>
        {items}
      </div>
    </section>
  )
}

export default CategorySection
