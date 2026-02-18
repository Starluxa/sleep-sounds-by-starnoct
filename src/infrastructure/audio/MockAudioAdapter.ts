import { IAudioPort, AudioCommand, PlaybackState } from '../../core/audio/IAudioPort';
import { SoundId } from '../../core/audio/ISoundEntity';

/**
 * MockAudioAdapter implements IAudioPort for testing and development.
 * It logs operations to the console instead of playing real audio.
 * 
 * This demonstrates the Hexagonal Architecture "Adapter" pattern,
 * allowing the infrastructure to be swapped without touching core logic.
 */
export class MockAudioAdapter implements IAudioPort {
  private activeSounds: Map<SoundId, PlaybackState> = new Map();
  private masterVolume: number = 1.0;

  /**
   * Executes an audio command by logging it and updating internal mock state.
   */
  async execute(command: AudioCommand): Promise<void> {
    switch (command.type) {
      case 'PLAY':
        console.log(`[MockAudio] PLAY: ${command.sound.id} (Volume: ${command.sound.volume})`);
        this.activeSounds.set(command.sound.id, PlaybackState.PLAYING);
        break;

      case 'STOP':
        console.log(`[MockAudio] STOP: ${command.soundId}`);
        this.activeSounds.delete(command.soundId);
        break;

      case 'PAUSE_ALL':
        console.log('[MockAudio] PAUSE_ALL');
        for (const [id, state] of this.activeSounds.entries()) {
          if (state === PlaybackState.PLAYING) {
            this.activeSounds.set(id, PlaybackState.PAUSED);
          }
        }
        break;

      case 'RESUME_ALL':
        console.log('[MockAudio] RESUME_ALL');
        for (const [id, state] of this.activeSounds.entries()) {
          if (state === PlaybackState.PAUSED) {
            this.activeSounds.set(id, PlaybackState.PLAYING);
          }
        }
        break;

      case 'SET_VOLUME':
        console.log(`[MockAudio] SET_VOLUME: ${command.soundId} -> ${command.volume}`);
        break;

      case 'SET_MASTER_VOLUME':
        console.log(`[MockAudio] SET_MASTER_VOLUME: ${command.volume}`);
        this.masterVolume = command.volume;
        break;

      default:
        console.warn(`[MockAudio] Unknown command: ${(command as any).type}`);
    }
  }

  /**
   * Returns the mock playback state for a sound.
   */
  getPlaybackState(soundId: SoundId): PlaybackState {
    return this.activeSounds.get(soundId) || PlaybackState.IDLE;
  }

  /**
   * Returns the list of sound IDs currently in the mock "active" state.
   */
  getActiveSounds(): SoundId[] {
    return Array.from(this.activeSounds.keys());
  }

  /**
   * Simulates disposal of the audio system.
   */
  async dispose(): Promise<void> {
    console.log('[MockAudio] Disposing mock audio system');
    this.activeSounds.clear();
  }
}
