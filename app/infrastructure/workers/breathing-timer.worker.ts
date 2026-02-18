import { BreathingWorkerCommand, BreathingWorkerEvent } from '../../core/wellness/breathing/BreathingTypes';

/**
 * High-precision breathing timer worker.
 * Uses performance.now() and recursive setTimeout to minimize drift.
 * Ticks every 10ms to provide smooth updates for the breathing UI.
 */

let timerId: ReturnType<typeof setTimeout> | null = null;
let expected: number = 0;
const TICK_INTERVAL = 10; // 10ms

/**
 * The core tick function that calculates drift and schedules the next tick.
 */
function tick() {
  const now = performance.now();
  const drift = now - expected;

  // Send tick to main thread
  const event: BreathingWorkerEvent = { 
    type: 'TICK', 
    timestamp: now 
  };
  
  // Use the global postMessage available in Worker scope
  (self as unknown as Worker).postMessage(event);

  if (timerId !== null) {
    expected += TICK_INTERVAL;
    // Adjust next timeout based on drift to maintain high precision
    const nextTimeout = Math.max(0, TICK_INTERVAL - drift);
    timerId = setTimeout(tick, nextTimeout);
  }
}

/**
 * Starts the high-precision timer.
 */
function start() {
  if (timerId !== null) return;
  
  expected = performance.now() + TICK_INTERVAL;
  timerId = setTimeout(tick, TICK_INTERVAL);
}

/**
 * Stops the high-precision timer and clears resources.
 */
function stop() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}

/**
 * Listen for commands from the main thread.
 */
self.addEventListener('message', (event: MessageEvent<BreathingWorkerCommand>) => {
  try {
    const command = event.data;
    
    if (!command || typeof command.type !== 'string') {
      return;
    }

    switch (command.type) {
      case 'START':
        start();
        break;
      case 'STOP':
        stop();
        break;
      default:
        // Ignore unknown commands
        break;
    }
  } catch (error) {
    const errorEvent: BreathingWorkerEvent = { 
      type: 'ERROR', 
      message: error instanceof Error ? error.message : 'Unknown worker error' 
    };
    (self as unknown as Worker).postMessage(errorEvent);
  }
});
