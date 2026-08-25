import { Spinner } from "@salt-ds/core";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN a Spinner", () => {
  it.each([
    [undefined, "saltSpinner-medium"],
    ["default", "saltSpinner-medium"],
    ["large", "saltSpinner-large"],
  ] as const)("renders size %s", async (size, className) => {
    await renderWithSalt(<Spinner size={size} />);
    await expect
      .element(page.getByRole("img", { name: "loading" }))
      .toHaveClass(className);
  });

  it("has no a11y violations on load", async () => {
    const { container } = await renderWithSalt(<Spinner />);
    await runAxeScan(container);
  });
});
