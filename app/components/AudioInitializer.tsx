'use client'

import { useEffect, useRef } from 'react'
import { useAudioStore } from '@/lib/store'

/**
 * AudioInitializer - Ensures the AudioPort and MixEntity are initialized.
 *
 * This component must be mounted early in the app lifecycle (in layout.tsx)
 * to ensure the audio system is available before any audio operations occur.
 *
 * Pattern: Initialization Component (runs once on mount)
 */
export function AudioInitializer() {
  const initializeRef = useRef(false)
  const initializeMixEntity = useAudioStore(state => state.initializeMixEntity)
  const audioPort = useAudioStore(state => state.audioPort)
  const setHasUserGesture = useAudioStore(state => state.setHasUserGesture)

  useEffect(() => {
    // Ensure initialization only runs once
    if (initializeRef.current) return;
    initializeRef.current = true;
    
    // Initialize the orchestrator and mix entity
    initializeMixEntity();

  }, [initializeMixEntity]);

  useEffect(() => {
    // Wait for audioPort to be available from the store
    if (!audioPort) return;

    const handleGesture = async () => {
      try {
        // Initialize the audio engine (resumes AudioContext on web, starts session on native)
        await audioPort.initialize();
        
        // Update store state to signal that we have a valid user gesture
        setHasUserGesture(true);
      } catch (error) {
        // Silent fail
      } finally {
        // Always remove listeners after the first gesture attempt
        removeListeners();
      }
    };

    const removeListeners = () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
    };

    // Listen for common user interaction events
    // Note: Using pointerdown instead of mousedown for Chrome 132+ high-confidence interaction requirements
    window.addEventListener('click', handleGesture);
    window.addEventListener('touchstart', handleGesture);
    window.addEventListener('keydown', handleGesture);
    window.addEventListener('pointerdown', handleGesture);

    return removeListeners;
  }, [audioPort, setHasUserGesture]);

  return null;
}
