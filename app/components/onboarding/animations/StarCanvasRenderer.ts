/**
 * StarCanvasRenderer - Infrastructure Adapter for Canvas Rendering
 *
 * This adapter implements high-performance canvas rendering for onboarding stars.
 * It wraps the HTML5 Canvas API to provide a clean interface for drawing stars
 * while optimizing for hybrid app performance to avoid WebView layout engine overhead.
 *
 * Performance Optimizations:
 * - Batch drawing operations
 * - Minimize state changes
 * - Use integer coordinates
 * - Clear only when necessary
 * - Disable image smoothing for crisp pixels
 */

import { Star, IStarCanvasRenderer } from '../../../../src/core/onboarding/types';

/**
 * StarCanvasRenderer - Infrastructure adapter for star rendering
 *
 * Renders stars as filled circles with optimized Canvas operations.
 * Designed for high performance in hybrid apps by avoiding DOM manipulation
 * and using efficient Canvas API patterns.
 */
export class StarCanvasRenderer implements IStarCanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;

  /**
   * Creates a new StarCanvasRenderer
   * @param canvas The HTML canvas element to render onto
   */
  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    // Performance optimizations
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels
  }

  /**
   * Updates the canvas dimensions
   * @param width Canvas width in pixels
   * @param height Canvas height in pixels
   */
  public updateDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    // Re-apply performance settings after resize
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Checks if the renderer has valid dimensions for drawing
   * @returns True if width and height are both greater than 0
   */
  public hasValidDimensions(): boolean {
    return this.width > 0 && this.height > 0;
  }

  /**
   * Draws the stars onto the canvas
   * @param stars Array of stars to render
   */
  public drawStars(stars: Star[]): void {
    if (this.width === 0 || this.height === 0) {
      return;
    }
    // Clear the canvas (only when necessary, but for simplicity we clear all)
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Batch drawing: minimize state changes
    // All stars use the same fill style, so we can draw them all at once
    this.ctx.fillStyle = '#ffffff'; // White stars

    for (const star of stars) {
      if (star.opacity <= 0) continue;

      // Convert normalized coordinates to pixels
      const x = Math.floor(star.x * this.width);
      const y = Math.floor(star.y * this.height);

      // Draw star as filled circle
      this.drawStarCircle(x, y, star.size, star.opacity);
    }
  }

  /**
   * Draws a single star as a filled circle
   * @param x Center X coordinate in pixels
   * @param y Center Y coordinate in pixels
   * @param size Star size in pixels
   * @param opacity Opacity value (0-1)
   */
  private drawStarCircle(x: number, y: number, size: number, opacity: number): void {
    const radius = size / 2;

    // Set global alpha for this star
    this.ctx.globalAlpha = opacity;

    // Begin path for circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Reset global alpha
    this.ctx.globalAlpha = 1.0;
  }
}