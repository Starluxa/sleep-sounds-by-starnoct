'use client'

import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

export const triggerImpact = async (style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: style as any });
    } else {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  } catch (error) {
    // Silently fail on web/non-supported
  }
};