import { Star, IStarRenderer } from '../../core/visuals/starry/types';
import { 
  STAR_APPEARANCE, 
  GRADIENT_COLORS 
} from '../../core/visuals/starry/constants';

/**
 * CanvasStarRenderer Infrastructure Service
 * Responsible for low-level HTML5 Canvas API operations.
 * This is a "Dumb Infrastructure" layer that strictly executes commands.
 */
export class CanvasStarRenderer implements IStarRenderer {
  private ctx: CanvasRenderingContext2D;
  private linearGradient: CanvasGradient | null = null;
  private radialGradient: CanvasGradient | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.initializeGradients();
  }

  /**
   * Initializes or re-initializes gradients based on current canvas dimensions.
   * This is an expensive operation and should only be called when dimensions change.
   */
  private initializeGradients(): void {
    const { width, height } = this.canvas;
    
    // Linear background gradient
    this.linearGradient = this.ctx.createLinearGradient(0, 0, 0, height);
    GRADIENT_COLORS.LINEAR.forEach(({ stop, color }) => {
      this.linearGradient?.addColorStop(stop, color);
    });

    // Radial glow gradient
    const centerX = width * 0.65;
    const centerY = height * 0.35;
    this.radialGradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, width * 0.55
    );
    GRADIENT_COLORS.RADIAL.forEach(({ stop, color }) => {
      this.radialGradient?.addColorStop(stop, color);
    });
  }

  /**
   * Renders a single frame of the star field.
   * @param stars Array of stars to render
   * @param scrollOffset Optional scroll offset for parallax effect
   */
  public drawFrame(stars: Star[], scrollOffset: number = 0): void {
    this.clear();
    this.drawBackground();
    this.drawStars(stars, scrollOffset);
  }

  /**
   * Clears the canvas and resets global state.
   */
  private clear(): void {
    this.ctx.shadowBlur = 0;
    // We don't actually need to clearRect if we fill the whole background
  }

  /**
   * Draws the background gradients using cached values.
   */
  private drawBackground(): void {
    // Safety check: if gradients aren't initialized, do it once.
    // In a well-orchestrated system, updateDimensions should have been called first.
    if (!this.linearGradient || !this.radialGradient) {
      this.initializeGradients();
    }

    const { width, height } = this.canvas;
    
    // Use cached linear gradient
    this.ctx.fillStyle = this.linearGradient!;
    this.ctx.fillRect(0, 0, width, height);
    
    // Use cached radial gradient
    this.ctx.fillStyle = this.radialGradient!;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draws all stars in the field.
   */
  private drawStars(stars: Star[], scrollOffset: number): void {
    const { height } = this.canvas;
    const scrollMod = (scrollOffset % 1000) / 1000;

    for (const star of stars) {
      if (star.opacity <= 0) continue;

      let adjustedY = star.y + Math.sin(scrollMod * Math.PI * 2) * 5;
      // Wrap around Y if it goes off screen (though star.y is usually within bounds)
      if (adjustedY > height) adjustedY -= height;
      if (adjustedY < 0) adjustedY += height;

      this.renderStar(star.x, adjustedY, star.radius, star.opacity);
    }
  }

  /**
   * Renders an individual star with glow effect.
   */
  private renderStar(x: number, y: number, radius: number, opacity: number): void {
    const color = `${STAR_APPEARANCE.COLOR}${opacity})`;
    const glowColor = `${STAR_APPEARANCE.COLOR}${opacity * STAR_APPEARANCE.GLOW_INTENSITY})`;

    this.ctx.fillStyle = color;
    this.ctx.shadowBlur = STAR_APPEARANCE.GLOW_BLUR;
    this.ctx.shadowColor = glowColor;

    this.drawStarPath(x, y, radius);
    this.ctx.fill();
  }

  /**
   * Defines the 8-pointed star path.
   */
  private drawStarPath(x: number, y: number, radius: number): void {
    this.ctx.beginPath();
    
    // Optimization: Avoid save/restore by using relative coordinates in the loop
    // or just calculating absolute coordinates.
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const isMainPoint = i % 2 === 0;
      const pointRadius = isMainPoint ? radius : radius * 0.35;
      
      const px = x + Math.cos(angle) * pointRadius;
      const py = y + Math.sin(angle) * pointRadius;
      
      const innerAngle = angle + Math.PI / 8;
      const ix = x + Math.cos(innerAngle) * (radius * 0.08);
      const iy = y + Math.sin(innerAngle) * (radius * 0.08);
      
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
      this.ctx.lineTo(ix, iy);
    }
    
    this.ctx.closePath();
  }

  /**
   * Updates canvas dimensions and regenerates cached gradients.
   * @param width New canvas width
   * @param height New canvas height
   */
  public updateDimensions(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.initializeGradients();
  }
}
