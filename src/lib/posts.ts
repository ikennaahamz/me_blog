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

export function getRelatedPost(post: Post, posts: Post[]): Post | undefined {
  const topics = new Set(getPostTopics(post));

  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      post: candidate,
      score: getPostTopics(candidate).filter((topic) => topics.has(topic)).length,
    }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.post.data.publishedAt.valueOf() - left.post.data.publishedAt.valueOf() ||
        left.post.data.title.localeCompare(right.post.data.title),
    )[0]?.post;
}

export function getPostExcerpt(post: Post, maxLength = 220): string {
  const description = post.data.description.trim();
  if (description) return description;

  const body = (post.body ?? "").replace(/^---[\s\S]*?---\s*/, "").trim();
  const firstParagraph =
    body
      .split(/\n\s*\n/)
      .find((paragraph) => paragraph.trim() && !paragraph.trim().startsWith("#")) ?? "";

  const plain = firstParagraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > maxLength ? `${plain.slice(0, maxLength).trimEnd()}…` : plain;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
