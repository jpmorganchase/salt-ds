import assert from "node:assert/strict";
import test from "node:test";
import { chromium } from "playwright";
import { renderJunctionReviewPage } from "./junction-review-page.mjs";

test("the phone map shows scanned corners beside traced welds by default", async () => {
  const report = {
    summary: { exports: 1, reviewed: 0, pending: 1 },
    records: [{
      name: "battery_solid.svg",
      svg: '<svg viewBox="0 0 16 16" stroke-width="0.67"><path d="M4 2H12V15H4Z"/></svg>',
      joins: [{
        id: "j001",
        construction: "terminal shoulder",
        sector: "left",
        point: [5, 2],
        observations: [],
      }, {
        id: "j002",
        construction: "isolatedOpening",
        expected: "softened-opening",
        sector: "right-up",
        point: [8, 8],
        observations: [],
      }],
      candidates: [{
        id: "d001",
        kind: "contour-corner",
        x: 4,
        y: 15,
        sectors: [{ fromDegrees: 0, toDegrees: 90 }],
      }],
      review: { status: "pending", reason: "Not yet reviewed." },
    }],
  };
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.setContent(renderJunctionReviewPage(report));
    await page.locator('[data-name="battery_solid.svg"]').click();
    assert.equal(await page.locator("#marks").inputValue(), "all");
    assert.match(await page.locator("#feature-detail").innerText(), /0 visible softened openings; 1 unexposed opening traces/);
    assert.deepEqual(
      await page.locator("#drawing .marker").evaluateAll((markers) =>
        markers.map((marker) => marker.dataset.feature).sort()
      ),
      ["d001.1", "j001", "j002"],
    );
    assert.equal(
      await page.locator('[data-feature="d001.1"] circle').getAttribute("cy"),
      "15",
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await page.locator("#marks").selectOption("structural");
    assert.equal(await page.locator("#drawing .marker").count(), 3);
    await page.locator("#marks").selectOption("joins");
    assert.equal(await page.locator("#drawing .marker").count(), 2);
    await page.locator("#feature").selectOption("j002");
    assert.match(await page.locator("#feature-detail").innerText(), /not a join between separate objects/);
  } finally {
    await browser.close();
  }
});
test("the inspection queue includes occluded traces alongside other non-visible joins", async () => {
  const statuses = ["visible", "occluded", "submerged", "uncertain"];
  const records = statuses.map((status) => ({
    name: `${status}.svg`,
    svg: '<svg viewBox="0 0 16 16"><path d="M4 4H12V12H4Z"/></svg>',
    joins: [{
      id: "j001",
      construction: "inner join",
      point: [4, 4],
      observations: [{ status }],
    }],
    candidates: [],
    review: { status: "pending", reason: "Not yet reviewed." },
  }));
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(renderJunctionReviewPage({
      summary: { exports: 4, reviewed: 0, pending: 4 },
      records,
    }));
    assert.match(await page.locator("body").innerText(), /3 with measured joins to inspect/);
    await page.locator("#status").selectOption("needs-check");
    assert.deepEqual(
      await page.locator("[data-name]").evaluateAll((cards) =>
        cards.map((card) => card.dataset.name)
      ),
      ["occluded.svg", "submerged.svg", "uncertain.svg"],
    );
  } finally {
    await browser.close();
  }
});
