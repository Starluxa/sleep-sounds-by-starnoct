/**
 * Network status detection utility
 * Provides functions to check if the app is online/offline
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get initial network status
export const getNetworkStatus = (): boolean => {
  return isBrowser ? navigator.onLine : false;
};

// Subscribe to network status changes
export const subscribeToNetworkChanges = (
  callback: (isOnline: boolean) => void
): (() => void) => {
  if (!isBrowser) {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Check if a Supabase call should be attempted
export const shouldUseSupabase = (): boolean => {
  if (!isBrowser) return false;
  return navigator.onLine;
};

// Get user-friendly network status message
export const getNetworkStatusMessage = (isOnline: boolean): string => {
  return isOnline ? 'Online' : 'Offline';
};