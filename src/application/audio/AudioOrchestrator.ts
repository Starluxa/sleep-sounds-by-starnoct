import { RandomizerStrategy } from '../../core/audio/RandomizerStrategy';
import { ISoundEntity, SoundCategory } from '../../core/audio/ISoundEntity';
import { soundCategories } from '../../../app/data/soundsData';
import { AudioLogger } from './AudioLogger';
import { LuxAudioError } from './OrchestratorError';
import { MixEntity } from '../../domain/sounds/entities/MixEntity';
import { IAudioPort } from '../../core/audio/IAudioPort';
import { MixDomainError } from '../../domain/sounds/errors/MixDomainError';

/**
 * AudioOrchestrator coordinates the "Mixing Desk" logic.
 * It acts as the Application Layer that coordinates the MixEntity (Domain)
 * and IAudioPort (Infrastructure).
 */
export class AudioOrchestrator {
  private readonly strategy: RandomizerStrategy;
  private readonly logger: AudioLogger;
  private readonly audioPort: IAudioPort;
  private mix: MixEntity;

  constructor(
    audioPort: IAudioPort,
    mix?: MixEntity,
    strategy?: RandomizerStrategy,
    logger?: AudioLogger
  ) {
    this.audioPort = audioPort;
    this.mix = mix || MixEntity.create();
    this.strategy = strategy || new RandomizerStrategy();
    this.logger = logger || new AudioLogger();
  }

  /**
   * Returns the current MixEntity state.
   */
  public getMixState(): MixEntity {
    return this.mix;
  }

  /**
   * Hydrates the orchestrator with a provided mix state.
   * Diffs the provided mix against the current one and issues necessary commands.
   */
  public async hydrate(newMix: MixEntity): Promise<void> {
    this.logger.logIntent('HYDRATE_MIX', { mixId: newMix.id });

    const currentTracks = this.mix.tracks;
    const newTracks = newMix.tracks;

    // 1. Stop tracks that are in current but not in new
    for (const track of currentTracks) {
      if (!newTracks.find(t => t.id === track.id)) {
        await this.audioPort.execute({ type: 'STOP', soundId: track.id });
      }
    }

    // 2. Play or update tracks that are in new
    for (const track of newTracks) {
      const currentTrack = currentTracks.find(t => t.id === track.id);
      if (!currentTrack) {
        // New track: Play it
        const sound = this.findSoundById(track.id);
        if (sound) {
          const gain = MixEntity.calculateTransientGain(track.volume, newMix.masterVolume, newTracks.length);
          await this.audioPort.execute({ type: 'PLAY', sound: { ...sound, volume: gain } });
        }
      } else if (currentTrack.volume !== track.volume || this.mix.masterVolume !== newMix.masterVolume) {
        // Existing track with volume change: Update volume
        const gain = MixEntity.calculateTransientGain(track.volume, newMix.masterVolume, newTracks.length);
        await this.audioPort.execute({ type: 'SET_VOLUME', soundId: track.id, volume: gain });
      }
    }

    // 3. Update master volume if changed
    if (this.mix.masterVolume !== newMix.masterVolume) {
      await this.audioPort.execute({ type: 'SET_MASTER_VOLUME', volume: newMix.masterVolume });
    }

    this.mix = newMix;
  }

  /**
   * Adds a sound to the mix.
   */
  public async addSound(soundId: string): Promise<MixEntity> {
    try {
      this.logger.logIntent('ADD_SOUND', { soundId });

      // 1. Generate new immutable mix state (Domain)
      const newMix = this.mix.addTrack(soundId);

      // 2. Calculate initial volume (Infrastructure)
      const sound = this.findSoundById(soundId);
      if (!sound) {
        throw new LuxAudioError(`Sound ${soundId} not found`, 'SOUND_NOT_FOUND');
      }

      const track = newMix.getTrack(soundId);
      const initialVolume = track ? track.volume : 50;
      const gain = MixEntity.calculateTransientGain(initialVolume, newMix.masterVolume, newMix.trackCount);

      // 3. Play the sound
      await this.audioPort.execute({
        type: 'PLAY',
        sound: { ...sound, volume: gain }
      });

      // 4. Update internal state
      this.mix = newMix;
      return this.mix;
    } catch (error) {
      if (error instanceof MixDomainError) {
        this.logger.logIntent('ADD_SOUND_FAILED', { soundId, reason: error.message });
        throw error; // Re-throw so UI can handle (e.g., limit dialog)
      }
      throw error;
    }
  }

  /**
   * Removes a sound from the mix.
   */
  public async removeSound(soundId: string): Promise<MixEntity> {
    this.logger.logIntent('REMOVE_SOUND', { soundId });

    // 1. Check if sound exists in Entity (Idempotency)
    const track = this.mix.getTrack(soundId);
    
    // 2. Get new state (Domain)
    const newMix = this.mix.removeTrack(soundId);

    // 3. Stop the sound (Defensive: always call stop even if not in entity)
    await this.audioPort.execute({ type: 'STOP', soundId });

    // 4. Update internal state
    this.mix = newMix;
    return this.mix;
  }

  /**
   * Sets the volume for a specific track.
   */
  public async setTrackVolume(soundId: string, volume: number): Promise<MixEntity> {
    // 1. Update Domain state
    const newMix = this.mix.updateTrackVolume(soundId, volume);

    // 2. Calculate effective gain
    const gain = MixEntity.calculateTransientGain(volume, newMix.masterVolume, newMix.trackCount);

    // 3. Update hardware
    await this.audioPort.execute({
      type: 'SET_VOLUME',
      soundId,
      volume: gain
    });

    // 4. Update internal state
    this.mix = newMix;
    return this.mix;
  }

  /**
   * Sets the master volume for the entire mix.
   */
  public async setMasterVolume(volume: number): Promise<MixEntity> {
    // 1. Update Domain state
    const newMix = this.mix.updateMasterVolume(volume);

    // 2. Update hardware for all tracks (since master volume affects all)
    for (const track of newMix.tracks) {
      const gain = MixEntity.calculateTransientGain(track.volume, newMix.masterVolume, newMix.trackCount);
      await this.audioPort.execute({
        type: 'SET_VOLUME',
        soundId: track.id,
        volume: gain
      });
    }

    // Also set master volume on port if supported
    await this.audioPort.execute({
      type: 'SET_MASTER_VOLUME',
      volume
    });

    // 3. Update internal state
    this.mix = newMix;
    return this.mix;
  }

  /**
   * Stops all sounds and resets the mix.
   */
  public async stopAll(): Promise<MixEntity> {
    this.logger.logIntent('STOP_ALL');

    // 1. Stop all sounds in infrastructure
    for (const track of this.mix.tracks) {
      await this.audioPort.execute({ type: 'STOP', soundId: track.id });
    }

    // 2. Reset Domain state
    this.mix = MixEntity.create();
    return this.mix;
  }

  /**
   * Generates a random mix using the Domain strategy.
   */
  public async generateAndPlayRandomMix(): Promise<MixEntity> {
    this.logger.logIntent('GENERATE_RANDOM_MIX');

    // 1. Stop current mix
    await this.stopAll();

    // 2. Get available sounds
    const availableSounds = this.getAvailableSounds();

    // 3. Generate mix
    const selections = this.strategy.generateMix(availableSounds);

    // 4. Apply selections
    for (const selection of selections) {
      await this.addSound(selection.soundId);
      await this.setTrackVolume(selection.soundId, selection.volume);
    }

    return this.mix;
  }

  /**
   * Helper to find a sound by ID in the static data.
   */
  private findSoundById(soundId: string): ISoundEntity | undefined {
    for (const category of soundCategories) {
      const sound = category.sounds.find(s => s.id === soundId);
      if (sound) {
        return {
          id: sound.id,
          name: sound.name,
          category: sound.category as SoundCategory,
          type: sound.type as 'file' | 'synthetic',
          volume: 50,
          icon: sound.icon,
          audioUrl: (sound as any).audioUrl,
          metadata: (sound as any).syntheticConfig ? { syntheticConfig: (sound as any).syntheticConfig } : undefined
        };
      }
    }
    return undefined;
  }

  /**
   * Helper to convert legacy sound data to Domain entities.
   */
  private getAvailableSounds(): ISoundEntity[] {
    const allSounds: ISoundEntity[] = [];

    soundCategories.forEach(category => {
      category.sounds.forEach(sound => {
        allSounds.push({
          id: sound.id,
          name: sound.name,
          category: sound.category as SoundCategory,
          type: sound.type as 'file' | 'synthetic',
          volume: 50,
          icon: sound.icon,
          audioUrl: (sound as any).audioUrl,
          metadata: (sound as any).syntheticConfig ? { syntheticConfig: (sound as any).syntheticConfig } : undefined
        });
      });
    });

    return allSounds;
  }
}
