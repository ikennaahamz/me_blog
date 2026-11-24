/**
 * Pure geometry and motion math for the 3D book carousel.
 * Uses erasable TypeScript syntax so Node can import it directly in tests.
 */

export interface CarouselMetrics {
  ws: number;
  gap: number;
  dS: number;
}

export interface SlotVisualOptions {
  height: number;
  offsetX: number;
  tiltX: number;
  tiltY: number;
  lift: number;
}

export interface SlotVisualState {
  transform: string;
  zIndex: number;
  spineShade: string;
  coverShade: string;
}

/** Positive modulo into `[0, modulus)`. */
export function mod(value: number, modulus: number): number {
  if (modulus <= 0) return 0;
  return ((value % modulus) + modulus) % modulus;
}

/** Signed shortest wrapped distance from `position` to `index` in `[-total / 2, total / 2]`. */
export function wrapDelta(index: number, position: number, total: number): number {
  if (total <= 0) return 0;
  const delta = mod(index - position, total);
  return delta > total / 2 ? delta - total : delta;
}

/** Snap `current` to the nearest equivalent index modulo `count`. */
export function nearestTarget(current: number, targetIndex: number, count: number): number {
  if (count <= 0) return 0;
  const rounded = Math.round(current);
  return rounded + mod(targetIndex - mod(rounded, count) + count / 2, count) - count / 2;
}

/** Linearly interpolate cover width at fractional scroll `position`. */
export function interpolateWidth(position: number, widths: readonly number[]): number {
  const count = widths.length;
  if (count === 0) return 0;
  const base = Math.floor(position);
  const fraction = position - base;
  const left = widths[mod(base, count)] ?? 0;
  const right = widths[mod(base + 1, count)] ?? left;
  return left * (1 - fraction) + right * fraction;
}

/** Horizontal slot center offset, smoothly parting neighboring spines around the centered cover. */
export function computeSlotOffset(delta: number, metrics: CarouselMetrics): number {
  const spread =
    Math.abs(delta) < 1
      ? (delta + Math.sin(Math.PI * delta) / Math.PI) / 2
      : 0.5 * Math.sign(delta);
  return (
    delta * (metrics.ws + metrics.gap) +
    (metrics.dS - metrics.ws + 1.6 * metrics.gap) * spread
  );
}

/** 3D transform, stacking order, and face shading for a carousel slot at `delta`. */
export function computeSlotVisual(delta: number, opts: SlotVisualOptions): SlotVisualState {
  const u = Math.max(0, 1 - Math.abs(delta));
  const d = u * u * (3 - 2 * u);
  const translateY = -(0.025 * d) * opts.height - 0.045 * opts.lift * opts.height;
  const translateZ = 0.2 * d * opts.height;
  const rotateZ = -4.5 * d;
  const rotateX = opts.tiltX * d;
  const rotateY = -90 * d + opts.tiltY * d;

  return {
    transform: `perspective(2200px) translate3d(${opts.offsetX}px,${translateY}px,${translateZ}px) rotateZ(${rotateZ}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    zIndex: Math.round(100 - 4 * Math.abs(delta)),
    spineShade: (0.55 * d).toFixed(3),
    coverShade: ((1 - d) * 0.5).toFixed(3),
  };
}

/** Advance exponential smoothing one frame toward `target`. */
export function stepSmooth(
  current: number,
  target: number,
  dt: number,
  dragging: boolean,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return target;
  const rate = dragging ? 18 : 5.2;
  const next = current + (target - current) * (1 - Math.exp(-rate * dt));
  return Math.abs(target - next) < 1e-4 ? target : next;
}
