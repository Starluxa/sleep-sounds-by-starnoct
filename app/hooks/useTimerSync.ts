'use client'

import { useEffect } from 'react'
import { useAudioStore } from '@/lib/store'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

/**
 * Hook to sync the TimerOrchestrator from native state on app resume.
 * 
 * This hook listens for appStateChange events and calls timerOrchestrator.syncFromNative()
 * when the app returns to the active state. This ensures that the timer state is
 * correctly recovered after the app has been in the background, preventing
 * "temporal jump" issues where the displayed time lags behind the actual remaining time.
 * 
 * The listener is properly cleaned up when the component unmounts to prevent memory leaks.
 */
export function useTimerSync() {
  const timerOrchestrator = useAudioStore(state => (state as any).timerOrchestrator)

  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      return
    }

    if (!timerOrchestrator) {
      return
    }

    // Handle app state changes - sync from native when app becomes active
    const handleAppStateChange = async ({ isActive }: { isActive: boolean }) => {
      if (isActive) {
        try {
          await timerOrchestrator.syncFromNative()
        } catch (error) {
          // Silent fail
        }
      }
    }

    // Add the listener
    const listenerPromise = App.addListener('appStateChange', handleAppStateChange)

    // Cleanup function - remove the listener when component unmounts
    return () => {
      void listenerPromise.then((handle) => {
        handle.remove()
      })
    }
  }, [timerOrchestrator])
}
