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

let html;
let homeHtml;
let newestArticleHtml;
let middleArticleHtml;
let oldestArticleHtml;
let aboutHtml;

before(() => {
  buildSite();
  html = readFileSync("dist/books/index.html", "utf8");
  homeHtml = readFileSync("dist/index.html", "utf8");
  newestArticleHtml = readFileSync(
    "dist/writing/what-i-want-this-blog-to-remember/index.html",
    "utf8",
  );
  middleArticleHtml = readFileSync(
    "dist/writing/decisions-from-the-workbench/index.html",
    "utf8",
  );
  oldestArticleHtml = readFileSync(
    "dist/writing/study-notes-that-survived-the-week/index.html",
    "utf8",
  );
  aboutHtml = readFileSync("dist/about/index.html", "utf8");
});

test("the homepage starts with one h1 and three curated destinations", () => {
  assert.equal((homeHtml.match(/<h1(?:\s[^>]*)?>/g) ?? []).length, 1);
  assert.match(homeHtml, /<h1 id="home-title">I've Been thinking\.<\/h1>/);
  assert.match(homeHtml, /id="start-here-title">Start here<\/h2>/);
  assert.equal((homeHtml.match(/class="start-here-card"/g) ?? []).length, 3);
  assert.match(homeHtml, /What I want this blog to remember/);
  assert.match(homeHtml, /Decisions from the workbench/);
  assert.match(homeHtml, /The Forever Shelf/);
});

test("the generated site includes The Forever Shelf page", () => {
  assert.match(html, /<h1>The Forever Shelf<\/h1>/);
  assert.equal((html.match(/class="book-card"/g) ?? []).length, 15);
  assert.equal((html.match(/class="book-cover-placeholder"/g) ?? []).length, 12);
});

test("the shelf renders the three recommendations in author-surname order", () => {
  const atlas = html.indexOf("Atlas of the Heart");
  const godHumanAnimalMachine = html.indexOf("God, Human, Animal, Machine");
  const menExplainThings = html.indexOf("Men Explain Things to Me");

  assert.ok(atlas >= 0, "Atlas of the Heart is missing");
  assert.ok(godHumanAnimalMachine > atlas, "O'Gieblyn should follow Brown");
  assert.ok(menExplainThings > godHumanAnimalMachine, "Solnit should follow O'Gieblyn");
  assert.doesNotMatch(html, /covers\.openlibrary\.org/);
  assert.match(html, /_astro\/atlas-of-the-heart\.[^"\s]+\.webp/);
  assert.match(html, /_astro\/god-human-animal-machine\.[^"\s]+\.webp/);
  assert.match(html, /_astro\/men-explain-things-to-me\.[^"\s]+\.webp/);
  assert.match(html, /foreboding joy/);
  assert.match(html, /power shapes who gets heard/);
  assert.match(html, /AI as a purely technical subject/);
});

test("completed shelf notes have summaries and accessible disclosures", () => {
  assert.equal((html.match(/class="book-summary"/g) ?? []).length, 3);
  assert.equal((html.match(/<details class="book-details">/g) ?? []).length, 3);
  assert.equal((html.match(/<summary>Read full note<\/summary>/g) ?? []).length, 3);
  assert.match(html, /naming these feelings makes it easier/);
  assert.match(html, /resist treating AI as a purely technical subject/);
  assert.match(html, /power shapes who gets heard/);
});

test("the primary navigation links to the current Books page", () => {
  assert.match(html, /<a href="\/books\/" aria-current="page">Books<\/a>/);
});

test("articles offer related, chronological, and archive continuation", () => {
  assert.match(middleArticleHtml, /<h2>Keep reading<\/h2>/);
  assert.match(middleArticleHtml, /Related writing/);
  assert.match(
    middleArticleHtml,
    /href="\/writing\/what-i-want-this-blog-to-remember\/"[^>]*>[\s\S]*?What I want this blog to remember/,
  );
  assert.match(middleArticleHtml, /class="article-pagination-link newer"/);
  assert.match(middleArticleHtml, /class="article-pagination-link older"/);
  assert.match(middleArticleHtml, /class="all-writing-link" href="\/writing\/">View all writing/);
});

test("article boundaries omit unavailable chronological controls", () => {
  assert.doesNotMatch(newestArticleHtml, /class="article-pagination-link newer"/);
  assert.match(newestArticleHtml, /class="article-pagination-link older"/);
  assert.match(oldestArticleHtml, /class="article-pagination-link newer"/);
  assert.doesNotMatch(oldestArticleHtml, /class="article-pagination-link older"/);
});

test("the About page presents the current work as a semantic list", () => {
  assert.match(aboutHtml, /<section class="about-currently" aria-labelledby="currently-title">/);
  assert.match(aboutHtml, /<h2 id="currently-title">Currently<\/h2>/);
  assert.match(aboutHtml, /<dt>Building<\/dt><dd>This blog and UniBlood<\/dd>/);
  assert.match(aboutHtml, /<dt>Learning<\/dt><dd>Astro and frontend development<\/dd>/);
  assert.match(aboutHtml, /<dt>Curating<\/dt><dd><a href="\/books\/">The Forever Shelf<\/a><\/dd>/);
});
