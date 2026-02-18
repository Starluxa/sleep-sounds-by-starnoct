'use client';
import "./globals.css";
import BottomNav from "./components/custom/BottomNav";
import { LoadingProvider } from "./components/LoadingProvider";
import ErrorProvider from "./components/error-provider";
import StarryBackground from "./components/StarryBackground";
import GlobalErrorHandler from "./components/GlobalErrorHandler";

import { OnboardingFlowWrapper } from './components/onboarding/OnboardingFlowWrapper'
import { TimerProvider } from "./components/custom/TimerProvider";
import { LimitDialogWrapper } from "@/components/custom/LimitDialogWrapper";
import { NetworkStatusIndicator } from "./components/NetworkStatusIndicator";
import { AccessibilityProvider } from "@/contexts/accessibility-context";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';

import { useAudioStore } from '@/lib/store';
import { App as CapacitorApp } from '@capacitor/app';
import { BatteryOptimizationCheck } from './components/BatteryOptimizationCheck';
import { useAndroidAudio } from '@/hooks/useAndroidAudio';
import { AudioInitializer } from './components/AudioInitializer';

import dynamic from 'next/dynamic'
// IMPORTANT (React/Next on Capacitor):
// Client components still render on the server for initial HTML. Any Capacitor runtime checks
// (e.g. Capacitor.isNativePlatform()) will differ between server and device, causing hydration
// mismatches and React error #418.
//
// These components are runtime-dependent, so disable SSR.
const AudioPlayer = dynamic(() => import('./components/custom/AudioPlayer'), { loading: () => null, ssr: false })
const SyntheticAudioPlayer = dynamic(() => import('./components/custom/SyntheticAudioPlayer'), { loading: () => null, ssr: false })
const ActiveSoundsBar = dynamic(() => import('./components/custom/ActiveSoundsBar'), { loading: () => null, ssr: false })
const StatusBarHandler = dynamic(() => import('@/lib/status-bar-handler'), { ssr: false })

function DeepLinkHandler() {
  const router = useRouter();
 
  useEffect(() => {
    const handle = App.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url);
      if (url.searchParams.has('mix')) {
        const mixId = url.searchParams.get('mix') ?? '';
        router.push(mixId ? `/mix/${mixId}` : '/');
      }
    });
 
    return () => {
      // IMPORTANT: Do not call App.removeAllListeners() (it breaks other listeners like appStateChange).
      void handle.then((h) => h.remove());
    };
  }, [router]);
 
  return null;
}
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAndroidAudio();
  const pathname = usePathname();

  // Minimal critical CSS for above-the-fold rendering (header, background, card heights)
  const criticalCSS = `
    :root { --background: 230 35% 7%; --foreground: 210 40% 98%; --card: 230 30% 10%; --radius: 1rem; }
    html,body { height:100%; }
    body { background: linear-gradient(to bottom, hsl(230,35%,7%) 0%, hsl(240,40%,10%) 50%, hsl(250,40%,12%) 100%); color: hsl(var(--foreground)); min-height:100vh; margin:0; }
    /*
      IMPORTANT: Keep critical CSS narrowly scoped.
      Overriding common utility class names (e.g. .w-full, .rounded-lg) can make the UI look
      "broken" if the real Tailwind stylesheet fails to load after sleep/resume.
    */
    .critical-pb-16 { padding-bottom: 4rem; }
  `;

  useEffect(() => {
    const keepScreenOn = async () => {
      if (Capacitor.isNativePlatform()) {
        await KeepAwake.keepAwake();
      }
    };
    keepScreenOn();
  }, []);

  useEffect(() => {
    // Android-native: set engine to native and initialize audio session immediately
    // This ensures the AudioControl plugin is ready BEFORE the first sound click
    if (Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform()) {
      useAudioStore.getState().setAudioEngine('native');
      
      // Initialize the audio session immediately (don't wait for user gesture)
      // This creates the MediaSession and prepares the AudioService
      // Use a small delay to ensure audioPort is created by AudioInitializer
      const initTimer = setTimeout(() => {
        const audioPort = useAudioStore.getState().audioPort;
        if (audioPort) {
          audioPort.initialize().catch(() => {
            // Silent fail - AudioInitializer will retry on user gesture
          });
        }
      }, 100);
      
      return () => clearTimeout(initTimer);
    }
  }, []);

  useEffect(() => {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        // If we are at the root level, minimize the app instead of closing it
        CapacitorApp.minimizeApp();
      } else {
        // Otherwise go back in browser history
        window.history.back();
      }
    });
  }, []);

  return (
    <html lang="en">
      <head>
        {/* Inline critical CSS to reduce render-blocking */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <AudioInitializer />
        <NetworkStatusIndicator />
        <StarryBackground />
        <StatusBarHandler />
        <DeepLinkHandler />
        <GlobalErrorHandler />
        <ErrorProvider>
          <AccessibilityProvider>
              <LoadingProvider>
                <TimerProvider>
                  <div className="pb-16 critical-pb-16"> {/* Add padding for fixed bottom nav */}
                    {children}
                  </div>
                  <ActiveSoundsBar />
                  <AudioPlayer />
                  <SyntheticAudioPlayer />
                  <BatteryOptimizationCheck />
                  <BottomNav />
                  <LimitDialogWrapper />
                  <OnboardingFlowWrapper />
                </TimerProvider>
              </LoadingProvider>
            </AccessibilityProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
