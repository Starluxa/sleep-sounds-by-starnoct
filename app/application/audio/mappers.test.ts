import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';
import { mapMixToActiveSounds, mapActiveSoundsToMix } from './mappers';

describe('mapMixToActiveSounds', () => {
  it('should map an empty mix to an empty array', () => {
    const mix = MixEntity.create();
    const result = mapMixToActiveSounds(mix);
    expect(result).toEqual([]);
  });

  it('should map a mix with tracks to ActiveSound array', () => {
    const now = Date.now();
    const mix = MixEntity.create({
      tracks: [
        { id: 'rain', volume: 50, addedAt: now },
        { id: 'thunder', volume: 30, addedAt: now + 1000 }
      ]
    });

    const result = mapMixToActiveSounds(mix);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'rain',
      volume: 50,
      isPlaying: true,
      startTime: expect.any(Number)
    });
    expect(result[1]).toEqual({
      id: 'thunder',
      volume: 30,
      isPlaying: true,
      startTime: expect.any(Number)
    });
  });
});

describe('mapActiveSoundsToMix', () => {
  it('should map an empty array to an empty mix', () => {
    const result = mapActiveSoundsToMix([]);
    expect(result.trackCount).toBe(0);
  });

  it('should map ActiveSound array to a MixEntity', () => {
    const now = Date.now();
    const sounds = [
      { id: 'rain', volume: 50, startTime: now },
      { id: 'thunder', volume: 30, startTime: now + 1000 }
    ];

    const result = mapActiveSoundsToMix(sounds as any);

    expect(result.trackCount).toBe(2);
    expect(result.getTrack('rain')).toMatchObject({
      id: 'rain',
      volume: 50,
      addedAt: now
    });
    expect(result.getTrack('thunder')).toMatchObject({
      id: 'thunder',
      volume: 30,
      addedAt: now + 1000
    });
  });
});
