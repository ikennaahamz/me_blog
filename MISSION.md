# Mission: CDM for the Blog

## Why
Design a content data model for the blog so posts, notes, tags, authorship, assets, and publishing state are consistent before the site grows.

## Success looks like
- Define the core content types the blog needs.
- Decide the fields each content type should carry.
- Separate content structure from page layout.
- Make the model simple enough to start with Markdown/frontmatter now and migrate to a CMS later if needed.

## Constraints
- The current blog is a lightweight static site, so the first CDM should work without a backend.
- Prefer a model that can be represented in plain files first.
- Keep the first version small: posts, tags, author metadata, and assets are enough.

## Out of scope
- Full CMS migration.
- Multi-author editorial workflows.
- Complex personalization or recommendation systems.
