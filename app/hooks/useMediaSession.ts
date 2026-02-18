'use client'

import { useEffect } from 'react'
import { useAudioStore, selectActiveSounds } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { ActiveSound } from '@/types/sounds'
import { soundCategories } from '@/data/soundsData'
import { Capacitor } from '@capacitor/core';

type MediaImage = {
  src: string
  sizes?: string
  type?: string
}

export const useMediaSession = () => {
  const activeSounds = useAudioStore(useShallow(selectActiveSounds))
  const isPaused = useAudioStore(state => state.isPaused)
  const togglePausePlay = useAudioStore(state => state.togglePausePlay)

  const getMixTitle = (sounds: ActiveSound[]) => {
    if (sounds.length === 0) return 'StarNoct Sleep Sounds';

    const names = sounds.map(active => {
      // Find the sound object to get its name
      for (const cat of soundCategories) {
        const found = cat.sounds.find(s => s.id === active.id);
        if (found) return found.name;
      }
      return 'Sound';
    });

    // "Rain, Thunder & Fire"
    return names.slice(0, 3).join(', ') + (names.length > 3 ? '...' : '');
  };
  
  const getArtwork = (sounds: ActiveSound[]) => {
    if (sounds.length === 0) return [];

    // Find image for first sound
    let imageUrl = '/icon.png'; // Fallback
    for (const cat of soundCategories) {
      const found = cat.sounds.find(s => s.id === sounds[0].id);
      if (found) {
        imageUrl = `/images/sounds/${found.image.split('/').pop()?.replace(/\s/g, '-').replace(/\.[^/.]+$/, '') || found.id}.webp`;
        break;
      }
    }

    return [
      { src: imageUrl, sizes: '512x512', type: 'image/webp' }
    ];
  };

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Logic continues below...
    navigator.mediaSession.metadata = new MediaMetadata({
      title: getMixTitle(activeSounds),
      artist: 'StarNoct',
      album: 'Personal Mix',
      artwork: getArtwork(activeSounds)
    });

    const actionHandler = () => {
      togglePausePlay();
    };

    try {
      navigator.mediaSession.setActionHandler('play', actionHandler);
      navigator.mediaSession.setActionHandler('pause', actionHandler);
      navigator.mediaSession.setActionHandler('stop', actionHandler);

      // Clear handlers for next/prev since we don't use them yet
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    } catch (e) {
      // Ignore errors for unsupported actions in older browsers
    }

    navigator.mediaSession.playbackState =
      (activeSounds.length > 0 && !isPaused) ? 'playing' : 'paused';
  }, [activeSounds, isPaused, togglePausePlay]);
}