'use client'

import { useEffect, useCallback } from 'react'
import { useAudioStore } from '@/lib/store'
import { Capacitor } from '@capacitor/core'
import { audioEventBus } from '../core/audio/AudioEventBus'

/**
 * useAudioController - Web Audio Hook (Task 14: The Big Switch)
 *
 * This hook has been refactored to exclusively use the IAudioPort interface.
 * It no longer manages HTMLAudioElement refs or direct DOM manipulation.
 *
 * Responsibilities (Presentation Layer Only):
 * - Listen to store changes and delegate to AudioPort (Application Layer)
 * - Listen to AudioEventBus for loading/error states (UI feedback)
 *
 * Architecture: Presentation → Application (AudioPort) → Infrastructure (WebAudioAdapter)
 */
export const useAudioController = () => {
  const isPaused = useAudioStore(state => state.isPaused)
  const audioEngine = useAudioStore(state => state.audioEngine)
  const masterVolume = useAudioStore(state => state.audioSettings.volume)
  const audioPort = useAudioStore(state => state.audioPort)
  const hasUserGesture = useAudioStore(state => state.hasUserGesture)
  const mixEntity = useAudioStore(state => state.mixEntity)
  const syncMixUseCase = useAudioStore(state => state.syncMixUseCase)
  const webPaused = isPaused || audioEngine === 'native';

  // UI State Management
  const setAudioLoading = useAudioStore(state => state.setAudioLoading)
  const setAudioError = useAudioStore(state => state.setAudioError)

  /**
   * Event Handlers for UI State (via AudioEventBus)
   */
  useEffect(() => {
    const unsubStarted = audioEventBus.subscribe('loading_started', ({ soundId }) => {
      setAudioLoading(soundId, true)
      setAudioError(soundId, null)
    })

    const unsubFinished = audioEventBus.subscribe('loading_finished', ({ soundId }) => {
      setAudioLoading(soundId, false)
      setAudioError(soundId, null)
    })

    const unsubError = audioEventBus.subscribe('loading_error', ({ soundId, error }) => {
      setAudioLoading(soundId, false)
      setAudioError(soundId, error)
    })

    return () => {
      unsubStarted()
      unsubFinished()
      unsubError()
    }
  }, [setAudioLoading, setAudioError])

  /**
   * Master Volume Synchronization
   * 
   * When master volume changes in the store, update the audio port
   * so all active sounds are affected immediately
   */
  useEffect(() => {
    if (!audioPort || webPaused) return;
    
    void audioPort.setMasterVolume(masterVolume / 100);
  }, [masterVolume, audioPort, webPaused]);

  /**
   * Main Audio Synchronization Loop (Web Platform)
   *
   * This effect listens to changes in the MixEntity and delegates
   * synchronization to the SyncMixUseCase.
   */
  useEffect(() => {
    // Only run on web platform
    const platform = Capacitor.getPlatform()
    
    if (!syncMixUseCase || !mixEntity || platform === 'android' || !hasUserGesture) return

    // Handle Global Pause
    if (webPaused) {
      audioPort?.stopAll().catch(() => {})
      return
    }

    // Delegate all synchronization logic to the use case
    void syncMixUseCase.execute(mixEntity)

  }, [mixEntity, webPaused, syncMixUseCase, audioPort, hasUserGesture])

  // Cleanup on unmount - prevent ghost audio processes
  useEffect(() => {
    return () => {
      if (Capacitor.getPlatform() !== 'android') {
        audioPort?.stopAll().catch(() => {});
      }
    };
  }, [audioPort]);

  return {};
};
