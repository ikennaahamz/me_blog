import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import sharp from "sharp";
import { FALLBACK_PALETTE, pickSpinePaletteFromPixels, type SpinePalette } from "./book-spine";

export {
  FALLBACK_PALETTE,
  contrastRatio,
  getShortAuthor,
  getSpineTitle,
  pickSpinePaletteFromPixels,
  relativeLuminance,
  rgbToHex,
  type CarouselBookMeta,
  type SpinePalette,
} from "./book-spine";

export type Book = CollectionEntry<"books">;

const COVER_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export async function getPublishedBooks(): Promise<Book[]> {
  const books = await getCollection("books", ({ data }) => !data.draft);
  return books.sort(
    (left, right) =>
      left.data.authorSort.localeCompare(right.data.authorSort) ||
      left.data.title.localeCompare(right.data.title),
  );
}

export function hasNote(book: Book): boolean {
  return (book.body ?? "").trim().length > 0;
}

export function resolveLocalCoverPath(book: Book): string | null {
  if (book.filePath) {
    try {
      const markdown = readFileSync(book.filePath, "utf8");
      const match = markdown.match(/^cover:\s*["']?([^"'\r\n]+)["']?/m);
      const rawCover = match?.[1]?.trim();
      if (rawCover && !/^https?:\/\//i.test(rawCover)) {
        const resolved = path.resolve(path.dirname(book.filePath), rawCover);
        if (existsSync(resolved)) return resolved;
      }
    } catch {
      // Fall back to asset slug lookup below.
    }
  }

  for (const ext of COVER_EXTENSIONS) {
    const candidate = path.resolve("src/assets/books", `${book.id}${ext}`);
    if (existsSync(candidate)) return candidate;
  }

  return null;
}

export async function getBookSpinePalette(book: Book): Promise<SpinePalette> {
  const coverPath = resolveLocalCoverPath(book);
  if (!coverPath) return { ...FALLBACK_PALETTE };

  try {
    const { data } = await sharp(coverPath)
      .resize(24, 36, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return pickSpinePaletteFromPixels(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
  } catch {
    return { ...FALLBACK_PALETTE };
  }
}
