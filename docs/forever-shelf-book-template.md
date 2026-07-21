# Forever Shelf book template

Copy this into a new Markdown note in the Obsidian hub, complete it there, then copy the finished file into `src/content/books`.

```md
---
title: "Book title"
author: "Author name"
authorSort: "Surname, Given name"
isbn: "9780000000000"
summary: "Optional: a 45–70-word introduction explaining why this book belongs on the shelf."
cover: "../../assets/books/book-slug.jpg" # Optional
draft: true
---

Optionally write the complete personal note here. Explain what changed for you, the ideas you return to, and why the book continues to matter.
```

Use a lowercase hyphenated filename such as `book-title.md`, then set `draft: false` when the entry is ready to publish. Remove `summary` or `cover` when either is not ready. Missing covers receive a typographic placeholder, and the “Read full note” disclosure appears automatically after body text is added. When adding a cover, store a local image of at least 600×900 pixels at `src/assets/books/book-title.jpg`.
