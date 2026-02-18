import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { AudioControl } from '@/lib/native-audio-bridge';

export function useBatteryOptimization() {
  const [isIgnoring, setIsIgnoring] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkOptimization = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'android') {
      setLoading(false);
      return;
    }
    try {
      const { value } = await AudioControl.isIgnoringBatteryOptimizations();
      setIsIgnoring(value);
    } catch (e) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkOptimization();
  }, [checkOptimization]);

  const requestOptimization = async () => {
    if (Capacitor.getPlatform() !== 'android') return;
    try {
      await AudioControl.requestIgnoreBatteryOptimization();
    } catch (e) {
      // Silent fail
    }
  };

  return {
    isIgnoring,
    loading,
    checkOptimization,
    requestOptimization,
  };
}
