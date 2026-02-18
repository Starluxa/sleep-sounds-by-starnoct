import { Entity } from '../../core/entity';
import { HeadroomCalculator } from '../../../core/audio/HeadroomCalculator';
import { VolumePhysics } from '../../../core/audio/VolumePhysics';
import { MixDomainError } from '../errors/MixDomainError';
import { IMixState, ISoundItem, MixDTO } from '../types';

export class MixEntity extends Entity<IMixState, string> {
  private static readonly PEAK_THRESHOLD = 0.95;
  private static readonly MAX_TRACKS = 10;
  private static readonly MIN_VOL = 0;
  private static readonly MAX_VOL = 100;

  constructor(props: IMixState, id: string) {
    super(props, id);
    this.validate();
  }

  static create(props?: Partial<IMixState>): MixEntity {
    const now = Date.now();
    return new MixEntity({
      tracks: Object.freeze(props?.tracks || []),
      masterVolume: props?.masterVolume ?? 50,
      createdAt: props?.createdAt ?? now,
      updatedAt: props?.updatedAt ?? now,
    }, crypto.randomUUID?.() || `mix-${now}`);
  }

  get tracks() { return this.props.tracks; }
  get masterVolume() { return this.props.masterVolume; }
  get trackCount() { return this.props.tracks.length; }

  static calculateHeadroom(count: number): number {
    return HeadroomCalculator.calculate(count);
  }

  static getMaxTracks(): number {
    return MixEntity.MAX_TRACKS;
  }

  static getMinVolume(): number {
    return MixEntity.MIN_VOL;
  }

  static getMaxVolume(): number {
    return MixEntity.MAX_VOL;
  }

  /**
   * Determines if haptic feedback should be triggered for a given volume value.
   * 
   * @param value - The current volume level (0-100).
   * @returns true if haptics should be triggered, false otherwise.
   */
  static shouldTriggerHaptic(value: number): boolean {
    // Trigger haptics at the defined interval (10)
    return value % 10 === 0;
  }

  getTrackIds(): string[] {
    return this.props.tracks.map(t => t.id);
  }

  getTrack(id: string): ISoundItem | undefined {
    return this.props.tracks.find(t => t.id === id);
  }

  /**
   * Calculates the final gain for a track.
   * This is the "Slow Path" used for state updates.
   */
  calculateGain(trackVolume: number, masterVol: number = this.props.masterVolume): number {
    return MixEntity.calculateTransientGain(
      trackVolume,
      masterVol,
      this.props.tracks.length
    );
  }

  /**
   * Calculates the final gain for a track with an explicit master volume.
   * Used for high-frequency updates where master volume might be changing independently.
   */
  calculateTransientGainWithMaster(trackId: string, trackVolume: number, masterVolume: number): number {
    return MixEntity.calculateTransientGain(
      trackVolume,
      masterVolume,
      this.props.tracks.length
    );
  }

  /**
   * Calculates gains for multiple tracks at once.
   * Optimized for high-frequency updates.
   */
  calculateAllTransientGains(trackVolumes: Map<string, number>): Map<string, number> {
    const gains = new Map<string, number>();
    const trackCount = this.props.tracks.length;
    const masterVolume = this.props.masterVolume;

    for (const [trackId, volume] of trackVolumes) {
      gains.set(trackId, MixEntity.calculateTransientGain(volume, masterVolume, trackCount));
    }

    return gains;
  }

  /**
   * Fast-Path Transient Gain Optimization.
   * 
   * This method is designed for high-frequency calls (e.g., 60fps slider movements).
   * It performs the calculation in-memory without object allocation or state updates.
   * 
   * Formula: (linearVolume ^ 2) * HeadroomScalar * PeakThreshold
   * 
   * @param trackVolume - Volume of the track (0-100)
   * @param masterVolume - Master volume (0-100)
   * @param trackCount - Number of active tracks for headroom calculation
   */
  static calculateTransientGain(trackVolume: number, masterVolume: number, trackCount: number): number {
    const trackLinear = trackVolume / 100;
    const masterLinear = masterVolume / 100;
    
    // Use Square Law (x^2) for track volume for perceptual consistency
    // Use Linear scaling for master volume for more intuitive control
    const trackFactor = VolumePhysics.toGain(trackLinear);
    const masterFactor = masterLinear; // Linear, not squared
    
    const headroom = HeadroomCalculator.calculate(trackCount);
    
    return trackFactor * masterFactor * headroom * MixEntity.PEAK_THRESHOLD;
  }

  getAllGains(): Map<string, number> {
    const gains = new Map<string, number>();
    this.props.tracks.forEach(t => gains.set(t.id, this.calculateGain(t.volume)));
    return gains;
  }

  addTrack(id: string, volume: number = 50): MixEntity {
    if (this.props.tracks.length >= MixEntity.MAX_TRACKS) {
      throw MixDomainError.limitExceeded(this.props.tracks.length, MixEntity.MAX_TRACKS);
    }
    if (this.props.tracks.some(t => t.id === id)) throw MixDomainError.duplicateTrack(id);
    
    return new MixEntity({
      ...this.props,
      tracks: Object.freeze([...this.props.tracks, { id, volume, addedAt: Date.now() }]),
      updatedAt: Date.now(),
    }, this.id);
  }

  removeTrack(id: string): MixEntity {
    return new MixEntity({
      ...this.props,
      tracks: Object.freeze(this.props.tracks.filter(t => t.id !== id)),
      updatedAt: Date.now(),
    }, this.id);
  }

  updateTrackVolume(id: string, volume: number): MixEntity {
    const track = this.getTrack(id);
    if (track && track.volume === volume) return this;

    return new MixEntity({
      ...this.props,
      tracks: Object.freeze(this.props.tracks.map(t => t.id === id ? { ...t, volume } : t)),
      updatedAt: Date.now(),
    }, this.id);
  }

  updateMasterVolume(volume: number): MixEntity {
    const clampedVolume = Math.max(MixEntity.MIN_VOL, Math.min(MixEntity.MAX_VOL, volume));
    if (this.props.masterVolume === clampedVolume) return this;

    return new MixEntity({
      ...this.props,
      masterVolume: clampedVolume,
      updatedAt: Date.now(),
    }, this.id);
  }

  toDTO(): MixDTO {
    return {
      tracks: this.props.tracks.map(t => ({
        id: t.id,
        volume: t.volume,
        addedAt: t.addedAt
      })),
      masterVolume: this.props.masterVolume,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      version: 1
    };
  }

  static fromDTO(dto: MixDTO): MixEntity {
    return new MixEntity({
      ...dto,
      tracks: Object.freeze(dto.tracks.map(t => Object.freeze({ ...t })))
    }, crypto.randomUUID());
  }

  private validate(): void {
    if (this.props.masterVolume < MixEntity.MIN_VOL || this.props.masterVolume > MixEntity.MAX_VOL) {
      throw new Error("Invalid Master Volume");
    }
    if (this.props.tracks.length > MixEntity.MAX_TRACKS) {
      throw new Error("Track limit exceeded");
    }
    const ids = this.props.tracks.map(t => t.id);
    if (new Set(ids).size !== ids.length) {
      throw new Error("Duplicate track IDs");
    }
  }
}

