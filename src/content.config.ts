import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    type: z.enum(["essay", "note"]),
    tags: z
      .array(z.string().trim().min(1))
      .default([])
      .transform((tags) => [...new Set(tags.map((tag) => tag.toLowerCase()))]),
    draft: z.boolean().default(false),
  }),
});

const books = defineCollection({
  loader: glob({ base: "./src/content/books", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      authorSort: z.string(),
      isbn: z.string().optional(),
      summary: z.string().min(1).optional(),
      cover: z.union([image(), z.url()]).optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts, books };
