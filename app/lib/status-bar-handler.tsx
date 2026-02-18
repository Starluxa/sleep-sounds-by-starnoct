'use client'

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

export default function StatusBarHandler() {
  useEffect(() => {
    const initStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch (error) {
          // Silent fail
        }
      }
    };

    initStatusBar();
  }, []);

  return null;
}