import { soundCategories } from '@/data/soundsData';

export const getSoundImage = (soundId: string): string => {
  for (const category of soundCategories) {
    const sound = category.sounds.find(s => s.id === soundId);
    if (sound) return sound.image;
  }
  return '/default-image.webp';
};

export type GetSoundImage = typeof getSoundImage;