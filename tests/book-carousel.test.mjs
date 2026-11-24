import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { before } from "node:test";
import ts from "typescript";

async function loadTs(filePath) {
  const source = readFileSync(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

let math;
let spine;

before(async () => {
  math = await loadTs("src/lib/carousel-math.ts");
  spine = await loadTs("src/lib/book-spine.ts");
});

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}

test("mod and wrapDelta wrap across book boundaries cleanly", () => {
  assert.equal(math.mod(-1, 15), 14);
  assert.equal(math.mod(16, 15), 1);
  assert.equal(math.wrapDelta(0, 14, 15), 1);
  assert.equal(math.wrapDelta(14, 0, 15), -1);
  assert.equal(math.wrapDelta(7, 7, 15), 0);
});

test("nearestTarget finds the closest equivalent index modulo count", () => {
  assert.equal(math.nearestTarget(15, 14, 15), 14);
  assert.equal(math.nearestTarget(29, 0, 15), 30);
  assert.equal(math.nearestTarget(16.2, 2, 15), 17);
});

test("interpolateWidth blends widths across adjacent books", () => {
  const widths = [100, 200, 150];
  assert.equal(math.interpolateWidth(0, widths), 100);
  assert.equal(math.interpolateWidth(0.5, widths), 150);
  assert.equal(math.interpolateWidth(2.5, widths), 125);
});

test("computeSlotOffset is symmetric and parts neighbors around the centered cover", () => {
  const metrics = { ws: 45, gap: 9, dS: 200 };
  assert.equal(math.computeSlotOffset(0, metrics), 0);

  const left = math.computeSlotOffset(-1, metrics);
  const right = math.computeSlotOffset(1, metrics);
  assert.ok(Math.abs(left + right) < 1e-9);
  assert.ok(right > metrics.ws + metrics.gap);
  assert.ok(math.computeSlotOffset(2, metrics) > right);
});

test("computeSlotVisual rotates centered book cover forward and settles distant spines", () => {
  const center = math.computeSlotVisual(0, {
    height: 300,
    offsetX: 0,
    tiltX: 0,
    tiltY: 0,
    lift: 0,
  });
  assert.equal(center.zIndex, 100);
  assert.equal(center.spineShade, "0.550");
  assert.equal(center.coverShade, "0.000");
  assert.match(center.transform, /rotateZ\(-4\.5deg\)/);
  assert.match(center.transform, /rotateY\(-90deg\)/);

  const outer = math.computeSlotVisual(1.5, {
    height: 300,
    offsetX: 180,
    tiltX: 4,
    tiltY: 6,
    lift: 0,
  });
  assert.equal(outer.zIndex, 94);
  assert.equal(outer.spineShade, "0.000");
  assert.equal(outer.coverShade, "0.500");
  assert.match(outer.transform, /rotateZ\(0deg\)/);
  assert.match(outer.transform, /rotateY\(0deg\)/);
});

test("stepSmooth jumps immediately when reducedMotion is enabled", () => {
  assert.equal(math.stepSmooth(10, 15, 0.016, false, true), 15);
  const moved = math.stepSmooth(10, 15, 0.016, false, false);
  assert.ok(moved > 10 && moved < 15);
});

test("getSpineTitle and getShortAuthor format compact spine labels", () => {
  assert.equal(
    spine.getSpineTitle("Social Media: A Critical Introduction"),
    "Social Media",
  );
  assert.equal(spine.getSpineTitle("Atlas of the Heart"), "Atlas of the Heart");
  assert.equal(
    spine.getShortAuthor({ author: "Brené Brown", authorSort: "Brown, Brené" }),
    "Brown",
  );
});

test("pickSpinePaletteFromPixels preserves WCAG AA ink contrast across pixel regimes", () => {
  const makeBuffer = (r, g, b, accent) => {
    const buf = new Uint8Array(24 * 36 * 3);
    for (let i = 0; i < buf.length; i += 3) {
      const useAccent = accent && i % 9 === 0;
      const [cr, cg, cb] = useAccent ? accent : [r, g, b];
      buf[i] = cr;
      buf[i + 1] = cg;
      buf[i + 2] = cb;
    }
    return buf;
  };

  for (const buf of [
    makeBuffer(18, 22, 24, [210, 165, 74]),
    makeBuffer(248, 246, 238, [36, 56, 201]),
    makeBuffer(248, 232, 8, [35, 35, 35]),
    makeBuffer(128, 128, 128),
  ]) {
    const palette = spine.pickSpinePaletteFromPixels(buf);
    const fgContrast = spine.contrastRatio(hexToRgb(palette.bg), hexToRgb(palette.fg));
    const bandFgContrast = spine.contrastRatio(hexToRgb(palette.band), hexToRgb(palette.bandFg));
    assert.ok(fgContrast >= 4.5, `Expected fg contrast >= 4.5, got ${fgContrast}`);
    assert.ok(bandFgContrast >= 4.5, `Expected bandFg contrast >= 4.5, got ${bandFgContrast}`);
  }
});
