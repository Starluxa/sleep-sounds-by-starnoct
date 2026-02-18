import { SoundRegistry } from '../SoundRegistry';

describe('SoundRegistry', () => {
  describe('getById', () => {
    it('should return the correct sound object for a known ID', () => {
      const sound = SoundRegistry.getById('rain-window');
      expect(sound).toBeDefined();
      expect(sound?.id).toBe('rain-window');
      expect(sound?.name).toBe('Rain on a Windowpane');
      expect(sound?.category).toBe('rain');
    });

    it('should return undefined for a non-existent ID', () => {
      const sound = SoundRegistry.getById('non-existent-id');
      expect(sound).toBeUndefined();
    });

    it('should return synthetic config for synthetic sounds', () => {
      const sound = SoundRegistry.getById('white-noise');
      expect(sound).toBeDefined();
      expect(sound?.type).toBe('synthetic');
      // @ts-ignore - Accessing syntheticConfig which exists on synthetic sounds
      expect(sound?.syntheticConfig).toBeDefined();
      // @ts-ignore
      expect(sound?.syntheticConfig.color).toBe('white');
    });
  });

  describe('getByCategory', () => {
    it('should return the correct items for a category', () => {
      const rainSounds = SoundRegistry.getByCategory('rain');
      // Based on SoundManifest.ts, there are 6 rain sounds
      expect(rainSounds.length).toBe(6);
      rainSounds.forEach(sound => {
        expect(sound.category).toBe('rain');
      });
    });

    it('should return an empty array for a non-existent category', () => {
      const sounds = SoundRegistry.getByCategory('non-existent-category');
      expect(sounds).toEqual([]);
    });
  });
});

describe('SoundRegistry', () => {
  describe('getById', () => {
    it('should return the correct sound object for a known ID', () => {
      const sound = SoundRegistry.getById('rain-window');
      expect(sound).toBeDefined();
      expect(sound?.id).toBe('rain-window');
      expect(sound?.name).toBe('Rain on a Windowpane');
      expect(sound?.category).toBe('rain');
    });

    it('should return undefined for a non-existent ID', () => {
      const sound = SoundRegistry.getById('non-existent-id');
      expect(sound).toBeUndefined();
    });

    it('should return synthetic config for synthetic sounds', () => {
      const sound = SoundRegistry.getById('white-noise');
      expect(sound).toBeDefined();
      expect(sound?.type).toBe('synthetic');
      // @ts-ignore - Accessing syntheticConfig which exists on synthetic sounds
      expect(sound?.syntheticConfig).toBeDefined();
      // @ts-ignore
      expect(sound?.syntheticConfig.color).toBe('white');
    });
  });

  describe('getByCategory', () => {
    it('should return the correct items for a category', () => {
      const rainSounds = SoundRegistry.getByCategory('rain');
      // Based on SoundManifest.ts, there are 6 rain sounds
      expect(rainSounds.length).toBe(6);
      rainSounds.forEach(sound => {
        expect(sound.category).toBe('rain');
      });
    });

    it('should return an empty array for a non-existent category', () => {
      const sounds = SoundRegistry.getByCategory('non-existent-category');
      expect(sounds).toEqual([]);
    });
  });
});

