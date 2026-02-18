import { Star, IStarRenderer, IAppLifecycle } from '../../core/visuals/starry/types';
import { StarFactory } from '../../core/visuals/starry/StarFactory';
import { calculateStarOpacity } from '../../core/visuals/starry/math';
import { ANIMATION_TIMINGS } from '../../core/visuals/starry/constants';

/**
 * StarrySkyController Application Service
 * 
 * Orchestrates the star field animation loop, state updates, and rendering.
 * Acts as the "Brain" of the starry background feature.
 */
export class StarrySkyController {
  private stars: Star[] = [];
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private scrollOffset: number = 0;
  private unsubscribeLifecycle: (() => void) | null = null;

  constructor(
    private renderer: IStarRenderer,
    private appLifecycle: IAppLifecycle
  ) {
    // Bind tick to maintain 'this' context in requestAnimationFrame
    this.tick = this.tick.bind(this);
  }

  /**
   * Initializes the controller and sets up lifecycle listeners.
   */
  public init(): void {
    if (this.unsubscribeLifecycle) return;

    this.unsubscribeLifecycle = this.appLifecycle.onStateChange((isActive) => {
      if (isActive) {
        this.start();
      } else {
        this.stop();
      }
    });
  }

  /**
   * Cleans up resources and listeners.
   */
  public destroy(): void {
    this.stop();
    if (this.unsubscribeLifecycle) {
      this.unsubscribeLifecycle();
      this.unsubscribeLifecycle = null;
    }
  }

  /**
   * Initializes the star field with the given dimensions.
   * @param width Canvas width
   * @param height Canvas height
   */
  public initialize(width: number, height: number): void {
    this.stars = StarFactory.createStarField(width, height);
    this.renderer.updateDimensions(width, height);
  }

  /**
   * Starts the animation loop.
   */
  public start(): void {
    if (this.animationFrameId !== null) return;
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  /**
   * Stops the animation loop.
   */
  public stop(): void {
    if (this.animationFrameId === null) return;
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  /**
   * Updates the scroll offset for parallax effects.
   * @param offset Current scroll position
   */
  public setScrollOffset(offset: number): void {
    this.scrollOffset = offset;
  }

  /**
   * Handles window resize or orientation changes.
   * @param width New canvas width
   * @param height New canvas height
   */
  public updateDimensions(width: number, height: number): void {
    this.stars = StarFactory.createStarField(width, height);
    this.renderer.updateDimensions(width, height);
  }

  /**
   * The main animation loop tick.
   * Updates star state and triggers rendering.
   * @param timestamp High-resolution timestamp from requestAnimationFrame
   */
  private tick(timestamp: number): void {
    // Throttle to target FPS
    if (timestamp - this.lastTimestamp < ANIMATION_TIMINGS.FPS_TARGET) {
      this.animationFrameId = requestAnimationFrame(this.tick);
      return;
    }

    this.lastTimestamp = timestamp;

    // Update star state
    this.updateStars();

    // Render frame
    this.renderer.drawFrame(this.stars, this.scrollOffset);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  /**
   * Updates the opacity and cycle progress of each star.
   */
  private updateStars(): void {
    for (const star of this.stars) {
      // Increment progress based on target FPS and duration
      star.cycleProgress += ANIMATION_TIMINGS.FPS_TARGET / star.cycleDuration;
      
      // Wrap progress
      if (star.cycleProgress >= 1) {
        star.cycleProgress -= 1;
      }

      // Calculate new opacity
      star.opacity = calculateStarOpacity(star.cycleProgress, star.cycleDuration);
    }
  }
}
