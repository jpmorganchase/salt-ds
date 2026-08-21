import { expect, type Page } from "@playwright/test";

export async function expectNoAxeViolations(page: Page) {
  const violations = await page.evaluate(() => window.runAxe());
  expect(violations).toEqual([]);
}
