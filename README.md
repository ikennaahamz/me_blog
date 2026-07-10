# Ikenna Ahamz Blog

A writing-first personal blog built with Astro and Markdown, hosted at
[ikennaahamz.site](https://ikennaahamz.site).

## Development

```bash
npm install
npm run dev
```

Use `npm run check` to validate Astro and TypeScript, `npm run build` for a production build,
and `npm run preview` to serve the generated site locally.

## Publishing

Posts live in `src/content/posts` as Markdown files. Each post uses frontmatter for its title,
description, publication date, category, tags, draft status, and featured status. Obsidian remains
the canonical writing environment; publish by exporting or copying finished Markdown into the post
collection and committing it.

Pushes to `main` build and deploy the site to GitHub Pages through GitHub Actions. The custom domain
is defined in `public/CNAME`.
