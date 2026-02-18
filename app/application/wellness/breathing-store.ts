import { BreathingOrchestrator } from './BreathingOrchestrator';
import { BreathingSession } from '../../core/wellness/breathing/BreathingSession';
import { CapacitorHapticAdapter } from '../../infrastructure/device/CapacitorHapticAdapter';

/**
 * Singleton instance of the BreathingOrchestrator.
 * This ensures that only one breathing session and one worker are active at a time,
 * and provides a stable store for React's useSyncExternalStore.
 */
const session = new BreathingSession();
const haptics = new CapacitorHapticAdapter();

export const breathingOrchestrator = new BreathingOrchestrator(session, haptics);
