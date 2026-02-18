export interface StarryCanvasProps {
  starCount: number;
  starColor: string;
  speedFactor: number;
  backgroundColor: string;
}

export interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  cycleProgress: number;
  cycleDuration: number;
}

/**
 * Interface for the star field renderer.
 * Decouples the application logic from the infrastructure (Canvas).
 */
export interface IStarRenderer {
  drawFrame(stars: Star[], scrollOffset?: number): void;
  updateDimensions(width: number, height: number): void;
}

/**
 * Interface for application lifecycle events.
 * Decouples the application logic from platform-specific APIs (Capacitor).
 */
export interface IAppLifecycle {
  /**
   * Subscribes to app state changes (active/inactive).
   * @param callback Function to call when state changes
   * @returns Unsubscribe function
   */
  onStateChange(callback: (isActive: boolean) => void): () => void;
}
