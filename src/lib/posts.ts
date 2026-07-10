import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type Post = CollectionEntry<"posts">;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.sort(
    (left, right) => right.data.publishedAt.valueOf() - left.data.publishedAt.valueOf(),
  );
}

export function getPostTopics(post: Post): string[] {
  return [...new Set([post.data.category, ...post.data.tags.map((tag) => tag.toLowerCase())])];
}

export function getTopicCounts(posts: Post[]): Map<string, number> {
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    getPostTopics(post).forEach((topic) => counts.set(topic, (counts.get(topic) ?? 0) + 1));
  });

  return new Map([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

export function getReadingTime(body: string): number {
  const words = body.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}
