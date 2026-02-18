import { AudioOrchestrator } from './AudioOrchestrator';
import { MockAudioAdapter } from '../../infrastructure/audio/MockAudioAdapter';

/**
 * Singleton instance of the AudioOrchestrator.
 * This provides a single entry point for the application to interact with the 
 * audio domain logic, following the Strangler Fig pattern.
 */
export const orchestrator = new AudioOrchestrator(new MockAudioAdapter());

