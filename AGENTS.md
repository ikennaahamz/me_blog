# AGENTS.md

## Project Overview

A personal blog for long-form writing on philosophy, books, tech, and podcasts.
Built as a lightweight, writing-first static site. The primary purpose is a
genuine personal writing space, not a SaaS product.

**Owner:** Ikenna
**Status:** Astro MVP

## Stack

- **Site generator:** Astro with TypeScript
- **Content:** Astro Content Collections and Markdown
- **Styling:** Plain CSS
- **Deployment:** GitHub Pages through GitHub Actions
- **Content authoring:** Posts are drafted in Obsidian as Markdown first, then
  copied or exported into `src/content/posts`. This is the canonical authoring
  workflow; do not introduce a separate rich-text editor unless explicitly asked.

## Repository Structure

```
/public               # Static assets, CNAME, favicon
/src
  /components         # Shared site and post-list components
  /content/posts      # Markdown posts authored from Obsidian
  /layouts            # Base and article layouts
  /lib                # Post queries and display helpers
  /pages              # Home, archive, article, topic, about, and RSS routes
  /styles             # Global design system
astro.config.mjs
package.json
```

## Content Model

- `Post`: title, description, publishedAt, optional updatedAt, category, tags,
  draft, featured, and Markdown body
- Categories: philosophy / tech / books / podcasts
- Tags: free-form strings used to generate topic pages

Keep the model intentionally small. Do not add comments, likes, newsletter
signup, authentication, a database, or a CMS unless explicitly requested.

## Conventions

- **Astro/TypeScript:** strict TypeScript and small, focused components
- **CSS:** use the existing tokens and responsive layout conventions
- **Commits:** small and scoped; one logical change per commit
- **Content:** validate all post metadata through the content collection schema
- **No premature abstraction:** this is a single-author static blog

## What "done" looks like for MVP

1. Markdown posts render as accessible article pages
2. Home, archive, topic, about, RSS, and sitemap routes build successfully
3. Draft posts are excluded from production output
4. GitHub Pages deploys successfully at the custom domain

## Things to NOT do without asking first

- Don't introduce a new framework/library without discussing the need first
- Don't add user accounts, comments, or social features
- Don't restructure the content model significantly — confirm with the owner first
- Don't change the authoring workflow (Obsidian → Markdown → import) without
  discussing tradeoffs

## Useful Context for an Agent Picking This Up

- The owner is comfortable with Django, PostgreSQL, C, and Java, and is actively
  learning frontend development. Explanations can assume backend fluency but
  should be more explicit on Astro, TypeScript, and browser concepts.
- This project sits alongside **UniBlood**, but this blog deliberately uses a
  smaller architecture and should remain static unless its requirements change.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in this repository’s GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context domain documentation layout. See `docs/agents/domain.md`.
