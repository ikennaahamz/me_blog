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

before(() => {
  buildSite();
  html = readFileSync("dist/books/index.html", "utf8");
});

test("the generated site includes The Forever Shelf page", () => {
  assert.match(html, /<h1>The Forever Shelf<\/h1>/);
});

test("the shelf renders the three recommendations in author-surname order", () => {
  const atlas = html.indexOf("Atlas of the Heart");
  const godHumanAnimalMachine = html.indexOf("God, Human, Animal, Machine");
  const menExplainThings = html.indexOf("Men Explain Things to Me");

  assert.ok(atlas >= 0, "Atlas of the Heart is missing");
  assert.ok(godHumanAnimalMachine > atlas, "O'Gieblyn should follow Brown");
  assert.ok(menExplainThings > godHumanAnimalMachine, "Solnit should follow O'Gieblyn");
  assert.match(html, /covers\.openlibrary\.org\/b\/id\/12859914-L\.jpg/);
  assert.match(html, /covers\.openlibrary\.org\/b\/isbn\/9780385543828-L\.jpg/);
  assert.match(html, /covers\.openlibrary\.org\/b\/isbn\/9781608464661-L\.jpg/);
  assert.match(html, /foreboding joy/);
  assert.match(html, /power shapes who gets heard/);
  assert.match(html, /AI as a purely technical subject/);
});

test("the primary navigation links to the current Books page", () => {
  assert.match(html, /<a href="\/books\/" aria-current="page">Books<\/a>/);
});
