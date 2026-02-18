import { soundCategories } from './soundsData';
import type { ActiveSound } from '@/types/sounds';
import { getSoundImage } from '@/lib/utils/get-sound-image';

export type CuratedMix = { name: string; sounds: ActiveSound[]; image?: string };

const DEFAULT_MIXES: CuratedMix[] = [
  {
    name: "Deep Sleep Cabin",
    sounds: [
      { id: "heavy-downpour", volume: 60, isPlaying: true },
      { id: "fireplace", volume: 30, isPlaying: true },
      { id: "wind-pines", volume: 15, isPlaying: true },
    ],
  },
  {
    name: "Zen Garden",
    sounds: [
      { id: "gentle-river", volume: 50 },
      { id: "distant-seagulls", volume: 10 },
      { id: "white-noise", volume: 10 },
    ],
  },
  {
    name: "Focus Flow",
    sounds: [
      { id: "brown-noise", volume: 60 },
      { id: "coffee-shop", volume: 20 },
    ],
  },
] as const;

const validSoundIds = new Set(soundCategories.flatMap((category) => category.sounds.map((sound) => sound.id)));

DEFAULT_MIXES.forEach((mix, mixIndex) => {
  mix.sounds.forEach((sound) => {
    if (!validSoundIds.has(sound.id)) {
      throw new Error(
        `Invalid soundId '${sound.id}' in mix '${mix.name}' (index ${mixIndex}). ` +
        `This sound does not exist in soundsData.ts categories.`
      );
    }
  });
});

const DEFAULT_MIXES_WITH_IMAGES = DEFAULT_MIXES.map((mix: CuratedMix) => ({
  ...mix,
  image: getSoundImage(mix.sounds[0].id),
}));

export { DEFAULT_MIXES, DEFAULT_MIXES_WITH_IMAGES };