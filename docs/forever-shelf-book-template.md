# Forever Shelf book template

Copy this into a new Markdown note in the Obsidian hub, complete it there, then copy the finished file into `src/content/books`.

```md
---
title: "Book title"
author: "Author name"
authorSort: "Surname, Given name"
isbn: "9780000000000"
summary: "A 45–70-word introduction explaining the central reason this book belongs on the shelf. Keep it specific, personal, and easy to scan."
cover: "../../assets/books/book-slug.jpg"
draft: true
---

Write the complete personal note here. Explain what changed for you, the ideas you return to, and why the book continues to matter.
```

Use a lowercase hyphenated filename such as `book-title.md`. Store a local cover of at least 600×900 pixels at `src/assets/books/book-title.jpg`, then set `draft: false` when the entry is ready to publish.
