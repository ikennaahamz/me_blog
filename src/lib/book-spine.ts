/**
 * Pure spine palette and label helpers for book carousels.
 * Kept free of Astro and Node filesystem imports so tests can load it directly.
 */

export interface SpinePalette {
  bg: string;
  fg: string;
  band: string;
  bandFg: string;
}

export interface CarouselBookMeta {
  id: string;
  index: number;
  title: string;
  spineTitle: string;
  author: string;
  shortAuthor: string;
  isbn?: string;
  summary?: string;
  hasNote: boolean;
  group: "noted" | "reading";
  coverUrl: string | null;
  aspect: number;
}

const DARK_INK: [number, number, number] = [20, 23, 19];
const LIGHT_PAPER: [number, number, number] = [243, 242, 235];
const PURE_BLACK: [number, number, number] = [0, 0, 0];
const PURE_WHITE: [number, number, number] = [255, 255, 255];

export const FALLBACK_PALETTE: SpinePalette = {
  bg: "#232824",
  fg: "#f3f2eb",
  band: "#b1842f",
  bandFg: "#141713",
};

export function getSpineTitle(title: string): string {
  if (title.length > 28 && title.includes(":")) {
    return title.split(":")[0].trim();
  }
  return title;
}

export function getShortAuthor(book: { author: string; authorSort: string }): string {
  return book.authorSort.split(",")[0]?.trim() || book.author;
}

export function relativeLuminance(r: number, g: number, b: number): number {
  const [rl, gl, bl] = [r, g, b].map((channel) => {
    const srgb = Math.max(0, Math.min(255, channel)) / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function contrastRatio(
  left: readonly [number, number, number],
  right: readonly [number, number, number],
): number {
  const l1 = relativeLuminance(left[0], left[1], left[2]);
  const l2 = relativeLuminance(right[0], right[1], right[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((channel) =>
        Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"),
      )
      .join("")
  );
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function pickInkFor(bg: readonly [number, number, number]): [number, number, number] {
  const lightRatio = contrastRatio(bg, LIGHT_PAPER);
  const darkRatio = contrastRatio(bg, DARK_INK);
  if (Math.max(lightRatio, darkRatio) >= 4.5) {
    return lightRatio >= darkRatio ? LIGHT_PAPER : DARK_INK;
  }
  return contrastRatio(bg, PURE_WHITE) >= contrastRatio(bg, PURE_BLACK)
    ? PURE_WHITE
    : PURE_BLACK;
}

/** Derive high-contrast spine and band colors from an RGB pixel buffer. */
export function pickSpinePaletteFromPixels(data: Uint8Array): SpinePalette {
  if (data.length < 3) return { ...FALLBACK_PALETTE };

  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  for (let i = 0; i + 2 < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.floor(r / 24)},${Math.floor(g / 24)},${Math.floor(b / 24)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  const colors = [...buckets.values()]
    .map((bucket) => {
      const rgb: [number, number, number] = [
        bucket.r / bucket.count,
        bucket.g / bucket.count,
        bucket.b / bucket.count,
      ];
      return {
        rgb,
        count: bucket.count,
        lum: relativeLuminance(rgb[0], rgb[1], rgb[2]),
        sat: saturation(rgb[0], rgb[1], rgb[2]),
      };
    })
    .sort((a, b) => b.count - a.count);

  const dominant = colors[0];
  if (!dominant) return { ...FALLBACK_PALETTE };

  // Blend 12% toward warm paper or charcoal so spines feel printed rather than neon.
  const toneTarget: [number, number, number] =
    dominant.lum > 0.5 ? [236, 234, 226] : [22, 22, 22];
  const bgRgb: [number, number, number] = [
    dominant.rgb[0] * 0.88 + toneTarget[0] * 0.12,
    dominant.rgb[1] * 0.88 + toneTarget[1] * 0.12,
    dominant.rgb[2] * 0.88 + toneTarget[2] * 0.12,
  ];
  const fgRgb = pickInkFor(bgRgb);

  const vividBand = colors.find((candidate) => {
    const dist = Math.hypot(
      candidate.rgb[0] - bgRgb[0],
      candidate.rgb[1] - bgRgb[1],
      candidate.rgb[2] - bgRgb[2],
    );
    return (
      candidate.count >= 6 &&
      dist > 65 &&
      contrastRatio(bgRgb, candidate.rgb) >= 2.4 &&
      candidate.sat > 0.25
    );
  });
  const contrastBand =
    vividBand ??
    colors.find((candidate) => candidate.count >= 6 && contrastRatio(bgRgb, candidate.rgb) >= 3.0);
  const bandRgb = contrastBand ? contrastBand.rgb : fgRgb;
  const bandFgRgb = pickInkFor(bandRgb);

  return {
    bg: rgbToHex(bgRgb[0], bgRgb[1], bgRgb[2]),
    fg: rgbToHex(fgRgb[0], fgRgb[1], fgRgb[2]),
    band: rgbToHex(bandRgb[0], bandRgb[1], bandRgb[2]),
    bandFg: rgbToHex(bandFgRgb[0], bandFgRgb[1], bandFgRgb[2]),
  };
}
