import { IAudioPort } from '../../core/audio/IAudioPort';
import { MixEntity } from '../../../src/domain/sounds/entities/MixEntity';

/**
 * SyncMixUseCase
 * 
 * Synchronizes the state of a MixEntity to the audio engine.
 * This use case ensures that the native audio bridge (or web audio engine)
 * reflects the tracks and volumes defined in the domain entity.
 */
export class SyncMixUseCase {
  private isSyncing = false;
  private pendingMix: MixEntity | null = null;

  constructor(private readonly audioPort: IAudioPort) {}

  /**
   * Executes the synchronization logic.
   * 
   * @param mix The MixEntity to sync.
   */
  async execute(mix: MixEntity): Promise<void> {
    // If already syncing, store this mix as the next one to sync and return
    if (this.isSyncing) {
      this.pendingMix = mix;
      return;
    }

    this.isSyncing = true;
    this.pendingMix = null;

    try {
      await this.performSync(mix);
    } finally {
      this.isSyncing = false;
      
      // If a new mix arrived while we were syncing, sync it now
      if (this.pendingMix) {
        const nextMix = this.pendingMix;
        this.pendingMix = null;
        // Use setTimeout to avoid deep recursion and allow other tasks to run
        setTimeout(() => void this.execute(nextMix), 0);
      }
    }
  }

  /**
   * Internal method that performs the actual synchronization.
   */
  private async performSync(mix: MixEntity): Promise<void> {
    const tracks = mix.tracks;
    const masterVolume = mix.masterVolume;
    const trackCount = tracks.length;

    // 1. Get currently active sounds from the port to determine the delta
    const activeSoundIds = new Set(this.audioPort.getActiveSounds());
    const targetSoundIds = new Set(tracks.map(t => t.id));

    // 1.5 Sync master volume to the port first
    // We skip internal sync because we follow up with individual track updates
    await this.audioPort.setMasterVolume(masterVolume / 100, { skipSync: true });

    // 2. Stop sounds that are no longer in the mix (Parallel)
    const stopPromises = Array.from(activeSoundIds)
      .filter(id => !targetSoundIds.has(id))
      .map(async id => {
        try {
          await this.audioPort.stop(id);
        } catch (error) {
          // Silent fail in production
        }
      });

    await Promise.all(stopPromises);

    // 3. Start or update sounds in the mix (Parallel)
    const syncPromises = tracks.map(async track => {
      try {
        const gain = MixEntity.calculateTransientGain(
          track.volume,
          masterVolume,
          trackCount
        );

        if (!activeSoundIds.has(track.id)) {
          // New sound - start using raw track volume (0-1).
          // AudioPort will compute the final gain consistently with MixEntity.
          // This avoids the play(0)+setVolume race AND prevents double-scaling.
          await this.audioPort.play(track.id, track.volume / 100, true);
        } else {
          // Existing sound - update volume
          
          // Use GainPacket for smooth ramping and to bypass AudioPort's internal calculation
          await this.audioPort.setVolume(track.id, {
            targetGain: gain,
            rampDurationMs: 16,
            trackVolume: track.volume
          });
        }
      } catch (error) {
        // Silent fail in production
      }
    });

    await Promise.all(syncPromises);
  }
}
