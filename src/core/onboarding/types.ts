export interface Star {
  /** X coordinate (0-1 normalized) */
  x: number;
  /** Y coordinate (0-1 normalized) */
  y: number;
  /** Star size in pixels */
  size: number;
  /** Opacity value (0-1) */
  opacity: number;
  /** Animation cycle progress (0-1) */
  cycleProgress: number;
  /** Total duration of animation cycle in milliseconds */
  cycleDuration: number;
}

/**
 * IStarCanvasRenderer - Port interface for canvas rendering
 *
 * This interface defines the contract for rendering stars onto a canvas.
 * It wraps the Canvas API to prevent leakage of implementation details
 * into business logic.
 */
export interface IStarCanvasRenderer {
  /**
   * Updates the canvas dimensions
   * @param width Canvas width in pixels
   * @param height Canvas height in pixels
   */
  updateDimensions(width: number, height: number): void;

  /**
   * Draws the stars onto the canvas
   * @param stars Array of stars to render
   */
  drawStars(stars: Star[]): void;
}