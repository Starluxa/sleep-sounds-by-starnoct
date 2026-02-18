/**
 * AudioIntent represents a high-level user or system action related to audio.
 * This allows us to track what the user is trying to do, regardless of the implementation.
 */
export type AudioIntent = 
  | 'USER_REQUESTED_RANDOM_MIX'
  | 'USER_REQUESTED_PLAY'
  | 'USER_REQUESTED_STOP'
  | 'USER_REQUESTED_VOLUME_CHANGE'
  | 'SYSTEM_AUTO_STOP'
  | 'SYSTEM_TIMER_EXPIRED'
  | 'HYDRATE_MIX'
  | 'ADD_SOUND'
  | 'ADD_SOUND_FAILED'
  | 'REMOVE_SOUND'
  | 'STOP_ALL'
  | 'GENERATE_RANDOM_MIX';

/**
 * AudioLogger provides observability for the audio application layer.
 * It logs intents and metadata to help debug and track system behavior.
 * 
 * Following Clean Architecture, this is a simple utility that remains 
 * platform-agnostic and decoupled from specific logging frameworks.
 */
export class AudioLogger {
  /**
   * Logs an audio intent with optional metadata.
   * @param intent The high-level action being performed.
   * @param metadata Additional context (e.g., sound IDs, volume levels).
   */
  public logIntent(intent: AudioIntent, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const metaString = metadata ? JSON.stringify(metadata) : '';
    
    // In a production environment, this could be swapped with a more robust 
    // logging service injected via an interface. For now, we use console.
    console.log(`[${timestamp}] [AudioIntent] ${intent} ${metaString}`);
  }
}
