'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useOnboardingStars } from '../../../hooks/useOnboardingStars';
import { StarCanvasRenderer } from './StarCanvasRenderer';

export const StarField: React.FC<{ density?: 'low' | 'medium' | 'high' }> = ({
  density = 'low'
}) => {
  const stars = useOnboardingStars(density);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<StarCanvasRenderer | null>(null);
  const hasDrawnRef = useRef(false);

  const drawStarsIfReady = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer || stars.length === 0) return false;

    // Only draw if we have valid dimensions
    if (renderer.hasValidDimensions()) {
      renderer.drawStars(stars);
      hasDrawnRef.current = true;
      return true;
    }
    return false;
  }, [stars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new StarCanvasRenderer(canvas);
    hasDrawnRef.current = false;

    return () => {
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    let rafId: number;
    let attempts = 0;
    const maxAttempts = 10;

    const updateDimensionsAndDraw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      
      // Only update if we have valid dimensions
      if (rect.width > 0 && rect.height > 0) {
        renderer.updateDimensions(rect.width, rect.height);
        
        // Try to draw stars after setting dimensions
        if (!hasDrawnRef.current) {
          drawStarsIfReady();
        }
      } else if (attempts < maxAttempts) {
        // Layout not ready yet, try again on next frame
        attempts++;
        rafId = requestAnimationFrame(updateDimensionsAndDraw);
      }
    };

    // Start on next frame to allow layout to settle
    rafId = requestAnimationFrame(updateDimensionsAndDraw);

    const resizeObserver = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        renderer.updateDimensions(rect.width, rect.height);
        renderer.drawStars(stars);
        hasDrawnRef.current = true;
      }
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [stars, drawStarsIfReady]);

  // Additional effect to draw stars when they become available
  useEffect(() => {
    if (stars.length > 0 && !hasDrawnRef.current) {
      // Try immediately
      if (!drawStarsIfReady()) {
        // If not ready, try after a short delay
        const timer = setTimeout(drawStarsIfReady, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [stars, drawStarsIfReady]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};