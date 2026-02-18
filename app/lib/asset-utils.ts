import { Capacitor } from '@capacitor/core';

export function getAssetSource(path: string): string {
  // If it's an external / special scheme URL, return as-is
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('content://') ||
    path.startsWith('file://') ||
    path.startsWith('synthetic://')
  ) {
    return path;
  }
  
  // If native platform, ensure it doesn't have a double slash issue
  if (Capacitor.isNativePlatform()) {
    // Clean the path to ensure it starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath;
  }
  
  return path;
}
