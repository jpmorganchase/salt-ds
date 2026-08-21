import { expect, test } from "@playwright/test";
import type { ClickRecorder } from "../stories/button.story";
import { expectNoAxeViolations } from "./accessibility";

test.describe("Playwright Button component pilot", () => {
  test("renders a native button", async ({ mount }) => {
    const component = await mount("Button/ClickRecorder");
    const button = component.getByRole("button", { name: "Activate" });

    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("type", "button");
  });

  test("records real click callbacks and preserves state across update", async ({
    mount,
  }) => {
    const component = await mount<typeof ClickRecorder>(
      "Button/ClickRecorder",
      { label: "Activate" },
    );

    await component.getByRole("button", { name: "Activate" }).click();
    await expect(component.getByTestId("click-count")).toHaveValue("1");

    await component.update({ label: "Updated" });
    await component.getByRole("button", { name: "Updated" }).click();
    await expect(component.getByTestId("click-count")).toHaveValue("2");
  });

  test("records keyboard activation", async ({ mount }) => {
    const component = await mount("Button/ClickRecorder");
    const button = component.getByRole("button", { name: "Activate" });

    await button.focus();
    await button.press("Enter");
    await button.press("Space");
    await expect(component.getByTestId("click-count")).toHaveValue("2");
  });

  test("keeps focusable disabled buttons non-interactive", async ({
    mount,
    page,
  }) => {
    const component = await mount("Button/FocusableWhenDisabled");
    const button = component.getByRole("button", { name: "Save as draft" });

    await expect(button).toHaveAttribute("aria-disabled", "true");
    await button.focus();
    await expect(button).toBeFocused();
    await button.press("Enter");
    await button.press("Space");
    const box = await button.boundingBox();
    if (!box) throw new Error("Disabled pilot button has no bounding box");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(component.getByTestId("click-count")).toHaveValue("0");
  });

  test("has no Axe violations", async ({ mount, page }) => {
    await mount("Button/ClickRecorder");
    await expectNoAxeViolations(page);
  });
});
