import { expect, test } from "@playwright/test";
import type { Uncontrolled } from "../stories/search-input.story";
import { expectNoAxeViolations } from "./accessibility";

test.describe("Playwright SearchInput component pilot", () => {
  test("renders empty without a clear action", async ({ mount }) => {
    const component = await mount("SearchInput/Uncontrolled");

    await expect(
      component.getByRole("textbox", { name: "Search" }),
    ).toHaveValue("");
    await expect(
      component.getByRole("button", { name: "clear input" }),
    ).toHaveCount(0);
  });

  test("renders a serializable default value", async ({ mount }) => {
    const component = await mount<typeof Uncontrolled>(
      "SearchInput/Uncontrolled",
      { defaultValue: "default value" },
    );

    await expect(
      component.getByRole("textbox", { name: "Search" }),
    ).toHaveValue("default value");
    await expect(
      component.getByRole("button", { name: "clear input" }),
    ).toBeVisible();
  });

  test("records real input changes", async ({ mount }) => {
    const component = await mount("SearchInput/Uncontrolled");
    await component.getByRole("textbox", { name: "Search" }).fill("new value");

    await expect(component.getByTestId("changed-value")).toHaveValue(
      "new value",
    );
    await expect(component.getByTestId("change-count")).toHaveValue("1");
  });

  test("clears, records the callback, and restores focus", async ({
    mount,
  }) => {
    const component = await mount<typeof Uncontrolled>(
      "SearchInput/Uncontrolled",
      { defaultValue: "default value" },
    );
    const textbox = component.getByRole("textbox", { name: "Search" });

    await component.getByRole("button", { name: "clear input" }).click();
    await expect(textbox).toHaveValue("");
    await expect(textbox).toBeFocused();
    await expect(component.getByTestId("clear-count")).toHaveValue("1");
    await expect(component.getByTestId("changed-value")).toHaveValue("");
  });

  test("records submitted values", async ({ mount }) => {
    const component = await mount<typeof Uncontrolled>(
      "SearchInput/Uncontrolled",
      { defaultValue: "default value" },
    );
    await component.getByRole("textbox", { name: "Search" }).press("Enter");
    await expect(component.getByTestId("submitted-value")).toHaveValue(
      "default value",
    );
  });

  test("updates a controlled value through browser-owned state", async ({
    mount,
  }) => {
    const component = await mount("SearchInput/Controlled");
    const textbox = component.getByRole("textbox", { name: "Search" });
    await textbox.fill("value b");

    await expect(textbox).toHaveValue("value b");
    await expect(component.getByTestId("changed-value")).toHaveValue("value b");
  });

  test("records attempted changes without mutating a fixed value", async ({
    mount,
  }) => {
    const component = await mount("SearchInput/Fixed");
    const textbox = component.getByRole("textbox", { name: "Search" });
    await textbox.fill("value b");

    await expect(textbox).toHaveValue("value a");
    await expect(component.getByTestId("attempted-value")).toHaveValue(
      "value b",
    );
  });

  test("has no Axe violations", async ({ mount, page }) => {
    await mount("SearchInput/Uncontrolled");
    await expectNoAxeViolations(page);
  });
});
