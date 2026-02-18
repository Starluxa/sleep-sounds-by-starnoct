import { useRef, useLayoutEffect, useEffect } from 'react';
import { StarrySkyController } from '../application/visuals/StarrySkyController';
import { CanvasStarRenderer } from '../infrastructure/visuals/CanvasStarRenderer';
import { CapacitorAppLifecycle } from '../infrastructure/visuals/CapacitorAppLifecycle';

/**
 * useStarryController Hook
 * 
 * React hook that manages the lifecycle of the StarrySkyController.
 * It handles canvas initialization, event listeners, and cleanup.
 */
export const useStarryController = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<StarrySkyController | null>(null);

  // useLayoutEffect ensures the canvas is initialized before the first paint
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Instantiate Infrastructure Adapters
    // CanvasStarRenderer is a "Dumb Infrastructure" layer for Canvas API
    const renderer = new CanvasStarRenderer(canvas);
    
    // CapacitorAppLifecycle is a "Dumb Infrastructure" layer for Native Lifecycle
    const appLifecycle = new CapacitorAppLifecycle();

    // 2. Instantiate Application Service (The Brain)
    const controller = new StarrySkyController(renderer, appLifecycle);
    controllerRef.current = controller;

    // 3. Initialize and Start the animation loop
    controller.init();
    controller.initialize(window.innerWidth, window.innerHeight);
    controller.start();

    // 4. Cleanup on unmount
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  // Handle external events (Resize, Scroll) and pipe them to the controller
  useEffect(() => {
    const handleResize = () => {
      if (controllerRef.current) {
        controllerRef.current.updateDimensions(window.innerWidth, window.innerHeight);
      }
    };

    const handleScroll = () => {
      if (controllerRef.current) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        controllerRef.current.setScrollOffset(scrollY);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Sync initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return canvasRef;
};
