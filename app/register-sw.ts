'use client';

import { Capacitor } from '@capacitor/core';
export function registerServiceWorker() {
  // SWs are great for production/offline, but in Next.js dev they can cause confusing
  // failures (stale chunks, broken HMR, and lots of `Failed to fetch` noise) because
  // the dev server’s URLs and assets change constantly.
  //
  // So:
  // - Only REGISTER the SW in production
  // - In dev, best-effort UNREGISTER any previously-installed SW + clear caches
  if (Capacitor.isNativePlatform()) return;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Best-effort cleanup; don’t ever break rendering if this fails.
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
      .catch(() => undefined);

    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => undefined);
    }

    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        // Service Worker registered successfully
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
