'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AudioControl } from '@/lib/native-audio-bridge';
import { toast } from '@/hooks/use-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function BatteryOptimizationCheck() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const checkPermissionsAndBattery = async () => {
      // 1. Ask for Notification Permission (Required for Android 13+ Service)
      if (Capacitor.getPlatform() === 'android') {
        try {
          // Dynamic import so web builds don't require the dependency
          const mod = await import('@capacitor/push-notifications');
          const PushNotifications = mod.PushNotifications;
          const permStatus = await PushNotifications.checkPermissions();
          if (permStatus.receive === 'prompt') {
            await PushNotifications.requestPermissions();
          }
        } catch {
          // If plugin isn't installed, skip permission prompt (native builds should include it)
        }
      }

      // 2. Then check battery optimization
      const result = await AudioControl.isIgnoringBatteryOptimizations();
      if (!result.value) {
        setIsOpen(true);
      }
    };

    checkPermissionsAndBattery();

    // Re-check when app resumes (in case they went to settings and came back)
    const subPromise = App.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive) return;
      try {
        const res = await AudioControl.isIgnoringBatteryOptimizations();
        if (!res.value) {
          toast({
            title: 'Optimization Off',
            description: 'Background audio may stop soon. Enable optimization for reliable playback.',
          });
          setIsOpen(true);
        }
      } catch {
        // ignore
      }
    });

    return () => {
      void subPromise.then((h) => h.remove());
    };
  }, []);

  const handleConfirm = async () => {
    await AudioControl.requestIgnoreBatteryOptimization();
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enable Background Playback</AlertDialogTitle>
          <AlertDialogDescription>
            To keep sounds playing when your screen is off, Android requires you to disable battery optimization for this
            app.
            <br />
            <br />
            <strong>If you don't do this, sounds may stop after ~20 minutes on some devices.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm}>Fix Now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

