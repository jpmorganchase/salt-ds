import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { chromium } from "playwright";
import { checkPixelGrid } from "./pixel-grid.mjs";
const wrap = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" stroke-width="0.67">${body}</svg>`;

test("grid measurements distinguish a split 1px stroke from a pixel-centred stroke", async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage();
    const results = await checkPixelGrid(
      page,
      [8, 8 + 2 / 3].map((y) => ({
        name: `line-${y}`,
        svg: wrap(`<path d="M2 ${y}H14" fill="none" stroke="black"/>`),
      })),
    );
    assert.ok(Math.abs(results[0].samples[0].error - 0.5) < 0.001);
    assert.ok(results[1].samples[0].error < 0.001);
    assert.ok(results[1].samples[1].error < results[0].samples[1].error);
  } finally {
    await browser.close();
  }
});

test("covered construction lines do not contribute to the exposed edge score", async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage();
    const box = '<path d="M4 4H12V12H4Z" fill="black"/>';
    const hidden = '<path d="M8 5V11" fill="none" stroke="black"/>';
    const records = await checkPixelGrid(page, [
      { name: "box", svg: wrap(box) },
      { name: "covered", svg: wrap(hidden + box) },
      {
        name: "curve",
        svg: wrap('<path d="M4 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0Z"/>'),
      },
    ]);
    assert.deepEqual(records[0].samples, records[1].samples);
    assert.equal(records[2].samples[0].error, null);
  } finally {
    await browser.close();
  }
});

test("reviewed printer and primary control edges retain their 12px grid after export fitting", async () => {
  const names = [
    "print",
    "print_solid",
    "add",
    "remove",
    "divide",
    "arrow-left",
    "arrow-right",
    "arrow-up",
    "arrow-down",
    "move-horizontal",
    "move-vertical",
  ];
  const records = await Promise.all(
    names.map(async (name) => ({
      name,
      svg: await fs.readFile(
        new URL(`../../src/SVG/${name}.svg`, import.meta.url),
        "utf8",
      ),
    })),
  );
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const results = await checkPixelGrid(await browser.newPage(), records);
    for (const record of results) {
      assert.ok(
        record.samples[0].total > 12,
        `${record.name}: expected visible primary edges`,
      );
      assert.ok(
        record.samples[0].error < 0.01,
        `${record.name}: 12px edges moved off the grid`,
      );
    }
  } finally {
    await browser.close();
  }
});
