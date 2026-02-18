'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAudioStore, selectActiveSounds } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { useSyntheticAudio } from '@/hooks/useSyntheticAudio'
import { Capacitor } from '@capacitor/core'

export default function SyntheticAudioPlayer() {
  // Option A: Android native playback is handled exclusively by the native service.
  // Do not run the WebAudio synthetic pipeline on Android.
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    return null;
  }

  const activeSounds = useAudioStore(useShallow(selectActiveSounds))
  const masterVolume = useAudioStore(useCallback(s => s.audioSettings.volume, []))
  const isPaused = useAudioStore(state => state.isPaused)
  const audioEngine = useAudioStore(state => state.audioEngine)
  const hasUserGesture = useAudioStore(state => state.hasUserGesture)

  const audioRef = useRef<HTMLAudioElement>(null)
  const activeCount = activeSounds.length
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '')
  // When native engine is active (background), disable synthetic WebAudio pipeline.
  useSyntheticAudio(activeSounds, masterVolume, isPaused || audioEngine === 'native', hasUserGesture)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = 0.01
      audio.loop = true
    }
  }, [])

  useEffect(() => {
    if (!isIOS) return

    const audio = audioRef.current
    if (!audio) return

    const targetPlaying = !isPaused && activeCount > 0

    if (targetPlaying && audio.paused) {
      audio.play().catch(() => {
        // Silent fail for autoplay/policy issues
      })
    } else if (!targetPlaying && !audio.paused) {
      audio.pause()
    }
  }, [isPaused, activeCount, isIOS])

  return (
    <>
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
        preload="auto"
        style={{ display: 'none' }}
      />
    </>
  )
}
