import { useEffect } from 'react';
import { useAudioStore, selectActiveSounds } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export function useAndroidAudio() {
  const { isPaused, audioPort, timerOrchestrator, mixEntity, syncMixUseCase, masterVolume } = useAudioStore(
    useShallow((state) => ({
      isPaused: state.isPaused,
      audioPort: state.audioPort,
      timerOrchestrator: state.timerOrchestrator,
      mixEntity: state.mixEntity,
      syncMixUseCase: state.syncMixUseCase,
      masterVolume: state.audioSettings.volume,
    }))
  );

  // 1) Lifecycle Sync (Best Practice): sync once on resume + once on mount.
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    const handleResume = async () => {
      if (!audioPort) return;

      try {
        // 1. Sync Timer Orchestrator (Domain Layer)
        if (timerOrchestrator) {
          await timerOrchestrator.syncFromNative();
        }

        // 2. Sync Audio Service Status (Infrastructure Layer)
        const status = await audioPort.getServiceStatus();

        // Timer expired (or cleared) while we were sleeping.
        if (status.timeLeft === 0 && status.isRunning === false) {
          const currentState = useAudioStore.getState();

          // If UI thinks we are playing, force it into a paused/idle state.
          if (selectActiveSounds(currentState as any).length > 0 && !currentState.isPaused) {
            useAudioStore.setState({ isPaused: true });
            useAudioStore.getState().setSleepTimer({ timeLeft: 0, totalTime: 0, isRunning: false });
          }
        }

        // Timer is still running: sync remaining time for the UI.
        if (status.isRunning && status.timeLeft > 0) {
          useAudioStore.getState().setSleepTimer({
            timeLeft: Math.round(status.timeLeft),
            isRunning: true,
          });
        }
      } catch (e) {
        // Native sync failed
      }
    };

    // Handle app state changes for cleanup (prevents ghost audio processes)
    const subPromise = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        void handleResume();
      }
    });

    // Handle restored results (Android specific edge case)
    const restoredPromise = App.addListener('appRestoredResult', () => {
      void handleResume();
    });

    void handleResume();

    return () => {
      void subPromise.then((h) => h.remove());
      void restoredPromise.then((h) => h.remove());
    };
  }, [audioPort, timerOrchestrator]);

  // Cleanup on unmount - prevent ghost audio processes
  useEffect(() => {
    return () => {
      if (Capacitor.getPlatform() === 'android') {
        // Ensure all audio is stopped on unmount
        audioPort?.stopAll();
      }
    };
  }, [audioPort]);

  // beforeunload handler for web - ensures cleanup when user closes tab/window
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'web') return;

    const handleBeforeUnload = () => {
      // Ensure all audio is stopped to prevent ghost audio
      audioPort?.stopAll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [audioPort]);

  /**
   * Master Volume Synchronization
   * 
   * When master volume changes in the store, update the audio port
   * so all active sounds are affected immediately
   */
  /**
   * Master Volume Synchronization
   *
   * When master volume changes in the store, update the audio port
   * so all active sounds are affected immediately
   */
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android' || !audioPort || isPaused) return;
    
    void audioPort.setMasterVolume(masterVolume / 100);
  }, [masterVolume, audioPort, isPaused]);

  /**
   * Main Audio Synchronization Loop
   *
   * This effect listens to changes in the MixEntity and delegates
   * synchronization to the SyncMixUseCase.
   */
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android' || !syncMixUseCase || !mixEntity) return;

    // Handle Global Pause
    if (isPaused) {
      audioPort?.stopAll().catch(() => {});
      return;
    }

    // Delegate all synchronization logic to the use case
    void syncMixUseCase.execute(mixEntity);

  }, [mixEntity, isPaused, syncMixUseCase, audioPort]);
}
