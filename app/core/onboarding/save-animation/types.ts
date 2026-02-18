export interface HeartState {
  scale: number;
  opacity: number;
}

export interface RingState {
  scale: number;
  opacity: number;
}

export interface SparkleState {
  scale: number;
  opacity: number;
  rotation: number; // degrees
  x: number; // normalized 0-1 left-to-right
  y: number; // normalized 0-1 top-to-bottom
}

export interface SaveAnimationState {
  readonly heart: HeartState;
  readonly outerRing: RingState;
  readonly middleRing: RingState;
  readonly sparkles: readonly SparkleState[];
}

export interface ISaveAnimationPolicy {
  computeFrame(timestampMs: number): SaveAnimationState;
}