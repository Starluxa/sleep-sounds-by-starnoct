'use client';

import React, { useEffect, useState } from 'react';
import { subscribeToNetworkChanges, getNetworkStatus } from '@/lib/network-status';
import { toast } from 'sonner';
import { Wifi, WifiOff } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [hasNotified, setHasNotified] = useState<boolean>(false);

  useEffect(() => {
    // Get initial status
    const initialStatus = getNetworkStatus();
    setIsOnline(initialStatus);

    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkChanges((online) => {
      setIsOnline(online);

      // Show toast notification when network status changes
      if (!online) {
        toast.info('Offline Mode', {
          description: 'You are currently offline. Some features may be limited.',
          duration: 5000,
          icon: <WifiOff className="h-4 w-4" />,
        });
        setHasNotified(true);
      } else if (hasNotified) {
        // Only show "back online" if we previously showed offline notification
        toast.success('Back Online', {
          description: 'Your internet connection has been restored.',
          duration: 3000,
          icon: <Wifi className="h-4 w-4" />,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hasNotified]);

  // Only show indicator when offline
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
      <WifiOff className="h-4 w-4 text-yellow-500" />
      <span className="text-sm font-medium text-yellow-500">Offline</span>
    </div>
  );
};