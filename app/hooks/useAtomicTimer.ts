'use client'

import { useCallback, useRef, useSyncExternalStore } from 'react'
import { useAudioStore } from '@/lib/store'
import type { TimerOrchestrator, TimerSnapshot } from '../../src/application/timer/TimerOrchestrator'

interface AtomicTimerSnapshot {
  /** Remaining time in seconds (calculated from targetTimestamp - Date.now()) */
  timeLeft: number;
  /** Whether the timer is currently running (not paused/stopped) */
  isRunning: boolean;
  /** Whether the timer is currently paused */
  isPaused: boolean;
  /** Progress from 0 to 1 (how much time has elapsed) */
  progress: number;
  /** The original duration in seconds that the timer was set to */
  originalDuration: number;
}

/**
 * Hook to subscribe to the TimerOrchestrator's atomic timer state.
 * Uses React 18's useSyncExternalStore for tear-free rendering.
 * 
 * This hook provides a single source of truth for timer state across all UI components,
 * ensuring that ActiveSoundBar, TimerVisualizer, and TimerPage always show identical time.
 * 
 * Falls back to store's sleepTimer.timeLeft when orchestrator has no active timer
 * (e.g., when user sets timer while paused).
 * 
 * @returns AtomicTimerSnapshot with timeLeft, isRunning, isPaused, progress, and originalDuration
 */
export function useAtomicTimer(): AtomicTimerSnapshot {
  const timerOrchestrator = useAudioStore(state => (state as any).timerOrchestrator) as TimerOrchestrator | undefined;
  const storeTimeLeft = useAudioStore(state => state.sleepTimer.timeLeft);
  const storeTotalTime = useAudioStore(state => state.sleepTimer.totalTime);
  const storeIsRunning = useAudioStore(state => state.sleepTimer.isRunning);

  // Cache last snapshot to avoid infinite loops in useSyncExternalStore
  const lastSnapshotRef = useRef<AtomicTimerSnapshot | null>(null);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!timerOrchestrator) {
        // No orchestrator available, return no-op unsubscribe
        return () => {};
      }
      return timerOrchestrator.subscribe(callback);
    },
    [timerOrchestrator]
  );

  const getSnapshot = useCallback((): AtomicTimerSnapshot => {
    let newSnapshot: AtomicTimerSnapshot;

    if (!timerOrchestrator) {
      // No orchestrator available, use store values
      newSnapshot = {
        timeLeft: storeTimeLeft,
        isRunning: storeIsRunning,
        isPaused: !storeIsRunning && storeTimeLeft > 0,
        progress: storeTotalTime > 0 ? (storeTotalTime - storeTimeLeft) / storeTotalTime : 0,
        originalDuration: storeTotalTime,
      };
    } else {
      const orchestratorSnapshot = timerOrchestrator.getSnapshot();
      
      // If orchestrator has no active timer but store has timeLeft, use store values
      // This happens when user sets timer while paused
      if (orchestratorSnapshot.timeLeft === 0 && storeTimeLeft > 0) {
        newSnapshot = {
          timeLeft: storeTimeLeft,
          isRunning: false, // Not running in orchestrator yet
          isPaused: true,   // User needs to hit play
          progress: 0,      // Fresh timer
          originalDuration: storeTotalTime,
        };
      } else {
        newSnapshot = orchestratorSnapshot;
      }
    }

    // Compare with last snapshot to prevent infinite re-renders
    const lastSnapshot = lastSnapshotRef.current;
    if (
      lastSnapshot &&
      lastSnapshot.timeLeft === newSnapshot.timeLeft &&
      lastSnapshot.isRunning === newSnapshot.isRunning &&
      lastSnapshot.isPaused === newSnapshot.isPaused &&
      lastSnapshot.progress === newSnapshot.progress &&
      lastSnapshot.originalDuration === newSnapshot.originalDuration
    ) {
      return lastSnapshot;
    }

    lastSnapshotRef.current = newSnapshot;
    return newSnapshot;
  }, [timerOrchestrator, storeTimeLeft, storeTotalTime, storeIsRunning]);

  // Use React 18's useSyncExternalStore to subscribe to the TimerOrchestrator
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
