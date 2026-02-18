export interface IAudioPort {
  playSound(soundId: string, volume: number): Promise<void>;
  stopSound(soundId: string): Promise<void>;
  setVolume(soundId: string, volume: number): Promise<void>;
  stopAll(): Promise<void>;
}
  playSound(soundId: string, volume: number): Promise<void>;
  stopSound(soundId: string): Promise<void>;
  setVolume(soundId: string, volume: number): Promise<void>;
  stopAll(): Promise<void>;
}

