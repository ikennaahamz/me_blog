import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test, { before } from "node:test";

function buildSite() {
  const result = spawnSync("npm run build", {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: true,
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

let booksHtml;
let readingListHtml;
let homeHtml;
let writingHtml;
let topicsHtml;
let socialMediaTopicHtml;
let essayHtml;
let noteHtml;
let aboutHtml;

before(() => {
  buildSite();
  booksHtml = readFileSync("dist/books/index.html", "utf8");
  readingListHtml = readFileSync("dist/books/reading-list/index.html", "utf8");
  homeHtml = readFileSync("dist/index.html", "utf8");
  writingHtml = readFileSync("dist/writing/index.html", "utf8");
  topicsHtml = readFileSync("dist/topics/index.html", "utf8");
  socialMediaTopicHtml = readFileSync("dist/topics/social-media/index.html", "utf8");
  essayHtml = readFileSync(
    "dist/writing/the-social-media-mirror/index.html",
    "utf8",
  );
  noteHtml = readFileSync(
    "dist/writing/notes-that-survive-the-week/index.html",
    "utf8",
  );
  aboutHtml = readFileSync("dist/about/index.html", "utf8");
});

test("the homepage opens with one h1, a contents index, and two starting points", () => {
  assert.equal((homeHtml.match(/<h1(?:\s[^>]*)?>/g) ?? []).length, 1);
  assert.match(homeHtml, /<h1 id="home-title" class="home-title">I've been <br>thinking\.<\/h1>/);
  assert.match(homeHtml, /class="contents"/);
  assert.match(homeHtml, /Start here<\/span>/);
  assert.match(homeHtml, /The Forever Shelf<\/span>/);
  assert.match(homeHtml, /Topics<\/span>/);
  assert.match(homeHtml, /Writing<\/span>/);
  assert.equal((homeHtml.match(/class="home-lead"/g) ?? []).length, 1);
  assert.equal((homeHtml.match(/class="next-start"/g) ?? []).length, 1);
  assert.match(homeHtml, /href="\/writing\/the-social-media-mirror\/">The Social Media Mirror/);
  assert.match(
    homeHtml,
    /href="\/writing\/notes-that-survive-the-week\/"[^>]*><span>Next<\/span>Notes that survive the week/,
  );
  assert.doesNotMatch(homeHtml, /Recent writing/);
  assert.doesNotMatch(homeHtml, /class="post-row"/);
});

test("the homepage reflects the essay and note model", () => {
  assert.equal((homeHtml.match(/1 essay · 1 note/g) ?? []).length, 2);
  assert.match(homeHtml, /<span class="contents-count">3 books<\/span>/);
  assert.match(homeHtml, /<span class="contents-count">4 subjects<\/span>/);
  assert.match(homeHtml, /3 books with notes/);
  assert.match(homeHtml, /<li>Essay<\/li>/);
  assert.match(homeHtml, /href="\/topics\/tech\/">tech<sup>1<\/sup><\/a>/);
  assert.doesNotMatch(homeHtml, /(writing|learning|notes|projects|essay)<sup>/);
});

test("the generated site includes The Forever Shelf with noted books only", () => {
  assert.match(booksHtml, /<h1>The Forever Shelf<\/h1>/);
  assert.match(booksHtml, /3 books with notes/);
  assert.equal((booksHtml.match(/class="shelf-row"/g) ?? []).length, 1);
  assert.equal((booksHtml.match(/class="shelf-book"/g) ?? []).length, 3);
  assert.equal((booksHtml.match(/class="book-card"/g) ?? []).length, 3);
  assert.equal((booksHtml.match(/class="book-cover"/g) ?? []).length, 3);
  assert.doesNotMatch(booksHtml, /class="book-cover-placeholder"/);
  assert.doesNotMatch(booksHtml, /covers\.openlibrary\.org/);
  assert.match(booksHtml, /style="--shelf-columns: 3"/);
  assert.match(booksHtml, /href="\/books\/reading-list\/">Reading list · 12 books<\/a>/);
  assert.doesNotMatch(booksHtml, /Thinking in Systems/);
});

test("the shelf renders the three book notes in author-surname order", () => {
  const atlas = booksHtml.indexOf("Atlas of the Heart");
  const godHumanAnimalMachine = booksHtml.indexOf("God, Human, Animal, Machine");
  const menExplainThings = booksHtml.indexOf("Men Explain Things to Me");

  assert.ok(atlas >= 0, "Atlas of the Heart is missing");
  assert.ok(godHumanAnimalMachine > atlas, "O'Gieblyn should follow Brown");
  assert.ok(menExplainThings > godHumanAnimalMachine, "Solnit should follow O'Gieblyn");
  assert.match(booksHtml, /_astro\/atlas-of-the-heart\.[^"\s]+\.webp/);
  assert.match(booksHtml, /_astro\/god-human-animal-machine\.[^"\s]+\.webp/);
  assert.match(booksHtml, /_astro\/men-explain-things-to-me\.[^"\s]+\.webp/);
  assert.match(booksHtml, /foreboding joy/);
  assert.match(booksHtml, /power shapes who gets heard/);
  assert.match(booksHtml, /AI as a purely technical subject/);
});

test("completed shelf notes have summaries and accessible disclosures", () => {
  assert.equal((booksHtml.match(/class="book-summary"/g) ?? []).length, 3);
  assert.equal((booksHtml.match(/<details class="book-details">/g) ?? []).length, 3);
  assert.equal((booksHtml.match(/<summary>Read full note<\/summary>/g) ?? []).length, 3);
  assert.match(booksHtml, /naming these feelings makes it easier/);
  assert.match(booksHtml, /resist treating AI as a purely technical subject/);
  assert.match(booksHtml, /power shapes who gets heard/);
});

test("the reading list collects books that do not have notes", () => {
  assert.match(readingListHtml, /<h1>Reading list<\/h1>/);
  assert.match(readingListHtml, /12 books/);
  assert.equal((readingListHtml.match(/class="reading-list-item"/g) ?? []).length, 12);
  assert.match(readingListHtml, /Influence: The Psychology of Persuasion/);
  assert.match(readingListHtml, /Thinking in Systems/);
  assert.match(readingListHtml, /The Age of Surveillance Capitalism/);
  assert.doesNotMatch(readingListHtml, /Atlas of the Heart/);
  assert.doesNotMatch(readingListHtml, /class="book-cover"/);
  assert.match(readingListHtml, /<a href="\/books\/" aria-current="page">Books<\/a>/);
  assert.match(readingListHtml, /href="\/books\/">The Forever Shelf<\/a>/);
});

test("writing presents the essay and note as the two formats", () => {
  assert.match(writingHtml, /<p class="page-intro-note">1 essay · 1 note<\/p>/);
  assert.match(writingHtml, /class="post-meta"><span>Essay<\/span>/);
  assert.match(writingHtml, /class="post-meta"><span>Note<\/span>/);
  assert.match(
    writingHtml,
    /class="archive-note">Book notes live in <a href="\/books\/">The Forever Shelf<\/a>\.<\/p>/,
  );
  assert.equal((writingHtml.match(/class="post-row"/g) ?? []).length, 2);
  assert.doesNotMatch(writingHtml, /what-i-want-this-blog-to-remember/);
  assert.doesNotMatch(writingHtml, /decisions-from-the-workbench/);
  assert.doesNotMatch(writingHtml, /study-notes-that-survived-the-week/);
});

test("articles offer related, chronological, and archive continuation", () => {
  assert.match(essayHtml, /<h2>Keep reading<\/h2>/);
  assert.match(essayHtml, /Related writing/);
  assert.match(
    essayHtml,
    /href="\/writing\/notes-that-survive-the-week\/"[^>]*>[\s\S]*?Notes that survive the week/,
  );
  assert.match(essayHtml, /class="article-pagination-link older"/);
  assert.doesNotMatch(essayHtml, /class="article-pagination-link newer"/);
  assert.match(essayHtml, /class="all-writing-link" href="\/writing\/">View all writing/);

  assert.match(noteHtml, /<h2>Keep reading<\/h2>/);
  assert.match(noteHtml, /Related writing/);
  assert.match(
    noteHtml,
    /href="\/writing\/the-social-media-mirror\/"[^>]*>[\s\S]*?The Social Media Mirror/,
  );
  assert.match(noteHtml, /class="article-pagination-link newer"/);
  assert.doesNotMatch(noteHtml, /class="article-pagination-link older"/);
  assert.match(noteHtml, /class="all-writing-link" href="\/writing\/">View all writing/);
});

test("articles show their format and written description", () => {
  assert.match(essayHtml, /<span class="article-type">Essay<\/span>/);
  assert.match(noteHtml, /<span class="article-type">Note<\/span>/);
  assert.match(essayHtml, /class="article-description"/);
  assert.match(noteHtml, /class="article-description"/);
  assert.match(noteHtml, /A working note on recording decisions/);
});

test("the About page carries the manifesto and current work", () => {
  assert.match(aboutHtml, /<h2>A public memory<\/h2>/);
  assert.match(aboutHtml, /<h2>Small pieces, returned to often<\/h2>/);
  assert.match(aboutHtml, /This site is where I keep public notes/);
  assert.match(aboutHtml, /<section class="about-currently" aria-labelledby="currently-title">/);
  assert.match(aboutHtml, /<h2 id="currently-title">Currently<\/h2>/);
  assert.match(aboutHtml, /<dt>Building<\/dt><dd>This blog and UniBlood<\/dd>/);
  assert.match(aboutHtml, /<dt>Learning<\/dt><dd>Astro and frontend development<\/dd>/);
  assert.match(aboutHtml, /<dt>Curating<\/dt><dd><a href="\/books\/">The Forever Shelf<\/a><\/dd>/);
  assert.doesNotMatch(aboutHtml, /what-i-want-this-blog-to-remember/);
});

test("topics use subject tags and exclude activity labels", () => {
  assert.match(topicsHtml, /<p class="page-intro-note">4 subjects<\/p>/);
  assert.equal((topicsHtml.match(/class="topic-name"/g) ?? []).length, 4);
  assert.match(topicsHtml, /<span class="topic-name">social media<\/span>/);
  assert.match(socialMediaTopicHtml, /<h1>social media<\/h1>/);
  assert.match(homeHtml, /href="\/topics\/social-media\/">social media<sup>/);
  assert.match(essayHtml, /<a href="\/topics\/social-media\/">social media<\/a>/);
  assert.match(noteHtml, /<a href="\/topics\/tech\/">tech<\/a>/);

  for (const label of ["writing", "learning", "notes", "essay", "projects"]) {
    assert.doesNotMatch(
      topicsHtml,
      new RegExp(`<span class="topic-name">${label}</span>`),
    );
  }
});

test("primary navigation marks the current section", () => {
  assert.match(booksHtml, /<a href="\/books\/" aria-current="page">Books<\/a>/);
  assert.match(readingListHtml, /<a href="\/books\/" aria-current="page">Books<\/a>/);
  assert.match(writingHtml, /<a href="\/writing\/" aria-current="page">Writing<\/a>/);
});
