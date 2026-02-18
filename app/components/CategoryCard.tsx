'use client';

import Image from "next/image";
import { Category } from "@/types/sounds";
import Link from 'next/link';
import { useAccessibility } from '@/contexts/accessibility-context';
import { getCardSizeConfig } from '@/lib/accessibility/card-sizes';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { cardSize } = useAccessibility();
  const config = getCardSizeConfig(cardSize);
  
  return (
    <div className="w-full">
      <Link href={`/sounds#${category.id}`}>
        <div
          className={`
            relative w-full ${config.containerClass} rounded-lg overflow-hidden cursor-pointer
            ring-1 ring-white/10 hover:ring-white/30 bg-slate-800/50
          `}
        >
          {/* Background with first sound image */}
          {category.sounds.length > 0 && (
            <Image
              src={`/images/sounds/${category.sounds[0].image.split('/').pop()?.replace(/\s/g, '-').replace(/\.[^/.]+$/, '') || category.sounds[0].id}.webp`}
              alt={category.name}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              className="absolute inset-0 w-full h-full"
              fetchPriority="high"
              unoptimized
            />
          )}

          {/* Light overlay for subtle dimming */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Content overlay */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${config.padding}`}>
            <span className={`${config.iconSize} mb-2 drop-shadow-lg`}>{category.icon}</span>
            <span
              className={`text-white ${config.titleSize} font-bold text-center drop-shadow-lg leading-tight mb-1 text-clamp-2 wrap-break-word px-1`}
            >
              {category.name}
            </span>
            <span className={`text-white ${config.countSize} text-center drop-shadow-lg font-semibold text-clamp-1`}>
              {category.sounds.length} sounds
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CategoryCard;
