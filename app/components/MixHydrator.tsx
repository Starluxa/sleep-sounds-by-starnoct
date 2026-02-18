'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { decodeMix } from '@/lib/share-utils';
import { useAudioStore } from '@/lib/store';

export default function MixHydrator() {
  const searchParams = useSearchParams();
  const hasHydrated = useRef(false);
  const setMix = useAudioStore(state => state.setMix);

  useEffect(() => {
    const mixParam = searchParams.get('mix');

    if (mixParam && !hasHydrated.current) {
      hasHydrated.current = true;

      try {
        const activeSounds = decodeMix(mixParam);

        if (activeSounds.length > 0) {
          setMix(activeSounds);
          useAudioStore.setState({
            isPaused: true,
            sleepTimer: {
              timeLeft: 0,
              totalTime: 0,
              isRunning: false,
              selectedTime: 15 * 60, // Default 15 minutes
              soundDefaults: {},
            },
          });

          toast.success('Mix loaded successfully!');

          // Clean URL
          const url = new URL(window.location.href);
          url.searchParams.delete('mix');
          window.history.replaceState({}, '', url.toString());
        }
      } catch (error) {
        console.warn('Failed to hydrate mix:', error);
        toast.error('Failed to load mix from URL');
      }
    }
  }, [searchParams]);

  return null;
}