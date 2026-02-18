import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';
import { ActiveSound } from '../../types/sounds';

/**
 * Maps a MixEntity to the legacy ActiveSound[] format for UI compatibility.
 * This is a pure transformation function.
 * 
 * @param mix - The MixEntity to transform
 * @returns An array of ActiveSound objects
 */
export function mapMixToActiveSounds(mix: MixEntity): ActiveSound[] {
  return mix.tracks.map(track => ({
    id: track.id,
    volume: track.volume,
    isPlaying: true,
    startTime: track.addedAt
  }));
}

/**
 * Maps legacy ActiveSound[] to a MixEntity.
 * 
 * @param sounds - The array of ActiveSound objects
 * @returns A new MixEntity
 */
export function mapActiveSoundsToMix(sounds: ActiveSound[]): MixEntity {
  const tracks = sounds.map(sound => ({
    id: sound.id,
    volume: sound.volume,
    addedAt: sound.startTime || Date.now()
  }));
  
  return MixEntity.create({ tracks });
}
