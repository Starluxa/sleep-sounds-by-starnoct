import { Capacitor, registerPlugin, Plugin } from '@capacitor/core';
import { audioEventBus } from '../core/audio/AudioEventBus';

export interface AudioControlPlugin extends Plugin {
  // Play a specific sound file (or synthetic ID)
  play(options: { soundId: string; url: string; volume: number; loop?: boolean }): Promise<void>;

  // Stop a specific sound
  stop(options: { soundId: string }): Promise<void>;

  // Stop ALL sounds (used when app is paused or reset)
  stopAll(): Promise<void>;

  // Update volume for a specific running sound
  setVolume(options: { soundId: string; volume: number }): Promise<void>;

  // The Nuclear Option: Set the native Android alarm
  setSleepTimer(options: { durationSec: number }): Promise<void>;

  // Atomic timer persistence (target timestamp)
  getPersistedTimestamp(): Promise<{ value: number }>;

  // Get status to sync UI
  getServiceStatus(): Promise<{
    timeLeft: number;
    isRunning: boolean;
    // Optional legacy fields (some debug screens still expect these)
    isPlaying?: boolean;
    isAlive?: boolean;
    tracksPlayingCount?: number;
    uptimeMs?: number;
    lastHeartbeatMs?: number;
    lastError?: string;
    lastErrorAtMs?: number;
  }>;

  isIgnoringBatteryOptimizations(): Promise<{ value: boolean }>;
  requestIgnoreBatteryOptimization(): Promise<void>;

  // Open email client with pre-filled content
  openEmail(options: { recipient: string; subject: string; body: string }): Promise<void>;

  // Open app store for rating/review
  openStore(options: { appId: string }): Promise<void>;

  // Initialize MediaSession and request Audio Focus
  initializeSession(): Promise<void>;
}

const AudioControl = Capacitor.isNativePlatform()
  ? registerPlugin<AudioControlPlugin>('AudioControl')
  : {
      play: async () => {},
      stop: async () => {},
      stopAll: async () => {},
      setVolume: async () => {},
      setSleepTimer: async () => {},
      getPersistedTimestamp: async () => ({ value: 0 }),
      getServiceStatus: async () => ({ isPlaying: false, timeLeft: 0, isRunning: false }),
      isIgnoringBatteryOptimizations: async () => ({ value: true }),
      requestIgnoreBatteryOptimization: async () => {},
      openEmail: async () => {},
      openStore: async () => {},
      initializeSession: async () => {},
      addListener: () => ({ remove: () => {} }),
      removeAllListeners: async () => {},
    } as unknown as AudioControlPlugin;

// Connect native events to the AudioEventBus
if (Capacitor.isNativePlatform()) {
  AudioControl.addListener('playback_terminated', (data: any) => {
    audioEventBus.emit('playback_terminated', { soundId: data.soundId });
  });
}

export { AudioControl };
