/** Match `.scan-window` in styles.css — overlay percentages mapped onto the video. */
export const VIEWFINDER_CROP = { x: 0.08, y: 0.3, w: 0.84, h: 0.32 } as const;

export const VIEWFINDER_CROP_PADDED = { x: 0.04, y: 0.24, w: 0.92, h: 0.44 } as const;

export type CoverMap = {
  scale: number;
  ox: number;
  oy: number;
};

export function coverMapping(
  videoW: number,
  videoH: number,
  overlayW: number,
  overlayH: number,
): CoverMap {
  const scale = Math.max(overlayW / Math.max(1, videoW), overlayH / Math.max(1, videoH));
  return {
    scale,
    ox: (overlayW - videoW * scale) / 2,
    oy: (overlayH - videoH * scale) / 2,
  };
}

export function videoToOverlay(
  x: number,
  y: number,
  map: CoverMap,
): { x: number; y: number } {
  return { x: map.ox + x * map.scale, y: map.oy + y * map.scale };
}

export function overlayToVideo(
  x: number,
  y: number,
  map: CoverMap,
): { x: number; y: number } {
  return { x: (x - map.ox) / map.scale, y: (y - map.oy) / map.scale };
}

export function barcodeWidth(corners: { x: number; y: number }[]): number {
  if (corners.length < 2) return 0;
  const xs = corners.map((c) => c.x);
  return Math.max(...xs) - Math.min(...xs);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpCorners(
  from: { x: number; y: number }[],
  to: { x: number; y: number }[],
  t: number,
): { x: number; y: number }[] {
  if (from.length !== to.length || from.length === 0) return to;
  return from.map((p, i) => ({
    x: lerp(p.x, to[i]!.x, t),
    y: lerp(p.y, to[i]!.y, t),
  }));
}
