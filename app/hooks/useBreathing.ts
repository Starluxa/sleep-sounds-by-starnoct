'use client'

import { useCallback, useSyncExternalStore, useEffect } from 'react'
import { breathingOrchestrator } from '@/application/wellness/breathing-store'
import type { BreathePhase } from '@/core/wellness/breathing/BreathingTypes'

interface UseBreathingReturn {
  phase: BreathePhase
  isActive: boolean
  timeLeft: number
  cycles: number
  totalTime: number
  toggle: () => void
  triggerHaptic: () => void
}

export const useBreathing = (): UseBreathingReturn => {
  const state = useSyncExternalStore(
    (callback) => breathingOrchestrator.subscribe(callback),
    () => breathingOrchestrator.getUISnapshot(),
    () => breathingOrchestrator.getUISnapshot()
  )

  // console.log('[useBreathing] Render with state:', state.phase, state.timeLeft);

  const isActive = state.isRunning && !state.isPaused

  // Cleanup on unmount: stop the orchestrator to terminate the worker
  useEffect(() => {
    return () => {
      breathingOrchestrator.reset()
    }
  }, [])

  /**
   * CSS Variable Animation Bridge
   * To achieve 120Hz smoothness and avoid React reconciliation for high-frequency animations,
   * we use CSS variable injection. This ensures that the circle expansion is handled by 
   * the GPU compositor, not the JS thread.
   */
  useEffect(() => {
    const unsubscribe = breathingOrchestrator.subscribe((state) => {
      // If paused, we might want to keep the current progress instead of resetting to 0
      // But the user said "continue where it left off", so we should keep the progress.
      const progressValue = state.isRunning ? state.progress.toFixed(4) : '0'
      document.documentElement.style.setProperty('--breath-progress', progressValue)
    })

    return () => {
      unsubscribe()
      // Reset the variable when the hook is unmounted
      document.documentElement.style.setProperty('--breath-progress', '0')
    }
  }, [])

  const toggle = useCallback(() => {
    if (isActive) {
      breathingOrchestrator.pause()
    } else {
      breathingOrchestrator.start()
    }
  }, [isActive])

  // Manual haptic trigger if needed by UI components
  const triggerHaptic = useCallback(() => {
    // The orchestrator handles phase-based haptics automatically,
    // but we provide this for manual interactions if necessary.
  }, [])

  return {
    phase: state.phase,
    isActive,
    timeLeft: state.timeLeft,
    cycles: state.cycleCount,
    totalTime: state.totalTime,
    toggle,
    triggerHaptic,
  }
}
