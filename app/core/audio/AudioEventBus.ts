/**
 * Events supported by the AudioEventBus.
 */
export type AudioEvents = {
  /**
   * Fired when a sound's playback is terminated.
   * This can happen due to the sound finishing naturally, 
   * being stopped manually, or interrupted by the system.
   */
  playback_terminated: { soundId: string };

  /**
   * Fired when a sound starts loading.
   */
  loading_started: { soundId: string };

  /**
   * Fired when a sound finishes loading successfully.
   */
  loading_finished: { soundId: string };

  /**
   * Fired when a sound fails to load.
   */
  loading_error: { soundId: string; error: string };

  /**
   * Fired when the sleep timer expires.
   */
  timer_expired: void;
};

type Listener<T> = (data: T) => void;

/**
 * A lightweight Event Bus for audio-related events.
 * This allows the infrastructure layer to notify the application layer
 * of asynchronous events like playback termination.
 */
export class AudioEventBus {
  private listeners: { [K in keyof AudioEvents]?: Listener<AudioEvents[K]>[] } = {};

  /**
   * Subscribe to an audio event.
   * @returns A function to unsubscribe.
   */
  subscribe<K extends keyof AudioEvents>(
    event: K,
    listener: Listener<AudioEvents[K]>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);

    return () => this.unsubscribe(event, listener);
  }

  /**
   * Unsubscribe from an audio event.
   */
  unsubscribe<K extends keyof AudioEvents>(
    event: K,
    listener: Listener<AudioEvents[K]>
  ): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = (this.listeners[event] as Listener<AudioEvents[K]>[]).filter((l) => l !== listener) as any;
  }

  /**
   * Emit an audio event to all subscribers.
   */
  emit<K extends keyof AudioEvents>(event: K, data: AudioEvents[K]): void {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach((listener) => listener(data));
  }
}

/**
 * Singleton instance of the AudioEventBus for easy sharing across the application.
 */
export const audioEventBus = new AudioEventBus();
