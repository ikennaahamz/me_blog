import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type Book = CollectionEntry<"books">;

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
