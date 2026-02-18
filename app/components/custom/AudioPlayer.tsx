'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { useAudioStore, selectActiveSounds } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { ActiveSound } from '@/types/sounds'
import { LoadingSpinner } from '../Skeletons'
import { useAudioController } from '@/hooks/useAudioController'
import { toast } from '@/hooks/use-toast'
import { useMediaSession } from '@/hooks/useMediaSession'
import { soundCategories } from '@/data/soundsData'
import { Capacitor } from '@capacitor/core'

export default function AudioPlayer() {
  // Android-native: playback is handled exclusively by the foreground service.
  // Do not mount WebView <audio> elements on Android, otherwise you can get
  // a “no-fade” start (web engine) racing the native fade-in.
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    return null;
  }

  // Optimize state selection - only subscribe to what we need
  const activeSounds = useAudioStore(useShallow(selectActiveSounds))
  const audioLoading = useAudioStore(useShallow(state => state.audioLoading))
  const audioErrors = useAudioStore(useShallow(state => state.audioErrors))
  const isPaused = useAudioStore(state => state.isPaused)
  const audioEngine = useAudioStore(state => state.audioEngine)
  const masterVolume = useAudioStore(useCallback(s => s.audioSettings.volume, []))
  const autoplayBlocked = useAudioStore(state => state.autoplayBlocked)

  useMediaSession();
  // When the native engine is selected (background), force WebView <audio> into a paused state.
  const webPaused = isPaused || audioEngine === 'native'
  useAudioController()

  const activeFileSounds = useMemo(() =>
    activeSounds.filter(sound => {
      const soundDef = soundCategories.flatMap(cat => cat.sounds).find(s => s.id === sound.id);
      return soundDef?.type !== 'synthetic';
    }),
  [activeSounds]
  );

  // Helper to get sound name from soundId
  const getSoundName = useCallback((soundId: string): string => {
    for (const category of soundCategories) {
      const sound = category.sounds.find(s => s.id === soundId);
      if (sound) return sound.name;
    }
    return soundId; // Fallback to ID if not found
  }, []);

  // Show toast for audio errors
  useEffect(() => {
    Object.entries(audioErrors).forEach(([soundId, error]) => {
      if (error) {
        const soundName = getSoundName(soundId);
        toast({
          title: "Audio Error",
          description: `Error loading ${soundName}: ${error}`,
          variant: "destructive",
        });
      }
    });
  }, [audioErrors, getSoundName]);

  // Show toast for autoplay blocked
  useEffect(() => {
    if (autoplayBlocked) {
      toast({
        title: "Autoplay Blocked",
        description: "Autoplay blocked by browser policy. Please interact with the page to enable sound.",
        variant: "default",
      });
    }
  }, [autoplayBlocked]);

  useEffect(() => {
    const handleAudioInterrupted = () => {
      const state = useAudioStore.getState();
      if (!state.isPaused && selectActiveSounds(state).length > 0) {
        state.togglePausePlay();
      }
    };

    window.addEventListener('audio-interrupted', handleAudioInterrupted);

    return () => {
      window.removeEventListener('audio-interrupted', handleAudioInterrupted);
    };
  }, []);

  return (
    <>
      {activeFileSounds.map((sound: ActiveSound) => (
        <div key={sound.id}>
          {audioLoading[sound.id] && (
            <div className="fixed bottom-4 right-4 z-50 bg-black/70 text-white p-3 rounded-full">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      ))}
    </>
  )
}
