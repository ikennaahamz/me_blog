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
    category: z.enum(["philosophy", "tech", "books", "podcasts"]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    startHereOrder: z.number().int().positive().optional(),
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
      cover: z.union([image(), z.string().url()]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts, books };
