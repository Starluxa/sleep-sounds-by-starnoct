/**
 * Pure Domain Types: Moon Visual Contract
 * 
 * These interfaces define the complete visual and animation contract for the Moon entity.
 * They form the Single Source of Truth (SSOT) in the hexagonal architecture's core domain layer.
 * 
 * - Platform-agnostic: No SVG, Canvas, React, or native dependencies.
 * - Immutable: All properties `readonly` to enforce unidirectional data flow.
 * - Renderer Port: Infrastructure adapters (SVGRenderer, CanvasRenderer) consume these contracts.
 * - Deletable Feature: Moon visuals can be removed without affecting core business logic.
 * 
 * Usage: Domain Use Cases emit MoonVisualState; Ports drive adapters with this contract.
 */

export type PathData = string;
export type Transform = string;
export type Color = string;
export type Length = number;
export type Opacity = number;
export type ViewBox = readonly [minX: number, minY: number, width: number, height: number];

export interface GradientStop {
  readonly offset: string; // e.g. '0%'
  readonly color: Color;
}

export interface EllipseGeometry {
  readonly cx: Length;
  readonly cy: Length;
  readonly rx: Length;
  readonly ry: Length;
}

export interface CircleGeometry {
  readonly cx: Length;
  readonly cy: Length;
  readonly r: Length;
}

export interface NightcapGeometry {
  readonly transform: Transform;
  readonly body: PathData;
  readonly fold: EllipseGeometry;
  readonly pompom: CircleGeometry;
}

export interface FaceGeometry {
  readonly opacity: Opacity;
  readonly leftEye: PathData;
  readonly rightEye: PathData;
  readonly smile: PathData;
}

export interface MoonGeometry {
  readonly viewBox: ViewBox;
  readonly body: PathData;
  readonly nightcap: NightcapGeometry;
  readonly face: FaceGeometry;
}

export interface MoonColors {
  readonly bodyGradient: readonly GradientStop[];
  readonly nightcap: {
    readonly body: {
      readonly fill: Color;
      readonly stroke: Color;
      readonly strokeWidth: Length;
    };
    readonly fold: {
      readonly fill: Color;
    };
    readonly pompom: {
      readonly fill: Color;
    };
  };
  readonly face: {
    readonly stroke: Color;
    readonly strokeWidthEyes: Length;
    readonly strokeWidthSmile: Length;
  };
}

export interface DropShadowFilter {
  readonly offsetX: Length;
  readonly offsetY: Length;
  readonly blurRadius: Length;
  readonly color: Color;
}

export interface RockAnimationParams {
  readonly duration: string; // CSS duration e.g. '3s'
  readonly easing: string; // CSS timing-function
  readonly transformBox: 'fill-box' | 'border-box' | 'view-box';
  readonly iterations: 'infinite';
}

export interface MoonAnimationParams {
  readonly bodyFilter: DropShadowFilter;
  readonly rock: RockAnimationParams;
  readonly faceOpacity: Opacity;
}