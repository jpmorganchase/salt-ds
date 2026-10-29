import { Dropdown } from "@salt-ds/lab";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const longSource = Array.from(
  { length: 5_000 },
  (_, index) => `Item ${index + 1}`,
);

describe("legacy Dropdown performance", () => {
  it("opens a 5000-item list", async () => {
    await renderWithSalt(<Dropdown id="test" source={longSource} />);
    const control = document.getElementById("test-control");
    if (!control) throw new Error("Missing legacy Dropdown control");
    await page.elementLocator(control).click();
    await expect.element(page.getByTestId("dropdown-list")).toBeVisible();
  });
});
