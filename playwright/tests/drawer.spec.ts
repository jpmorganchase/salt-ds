import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./accessibility";

test.describe("Playwright Drawer component pilot", () => {
  test("opens, focuses, and closes from its action", async ({
    mount,
    page,
  }) => {
    const component = await mount("Drawer/Dismissible");

    await component.getByRole("button", { name: "Open Drawer" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(component.getByTestId("drawer-open")).toHaveValue("true");
    await expect(
      page.getByRole("button", { name: "Close Drawer" }),
    ).toBeFocused();

    await page.getByRole("button", { name: "Close Drawer" }).click();
    await expect(component.getByTestId("drawer-open")).toHaveValue("false");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("dismisses through a real backdrop click", async ({ mount, page }) => {
    const component = await mount("Drawer/Dismissible");
    await component.getByRole("button", { name: "Open Drawer" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Floating UI makes the backdrop inert, so use a real coordinate click
    // instead of bypassing Playwright's locator actionability checks.
    await page.mouse.click(5, 5);

    await expect(component.getByTestId("drawer-open")).toHaveValue("false");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("dismisses with Escape", async ({ mount, page }) => {
    const component = await mount("Drawer/Dismissible");
    await component.getByRole("button", { name: "Open Drawer" }).click();
    await page.keyboard.press("Escape");

    await expect(component.getByTestId("drawer-open")).toHaveValue("false");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("traps focus inside the drawer", async ({ mount, page }) => {
    const component = await mount("Drawer/Dismissible");
    const closeButton = page.getByRole("button", { name: "Close Drawer" });
    await component.getByRole("button", { name: "Open Drawer" }).click();

    await expect(closeButton).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "First action" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Last action" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(closeButton).toBeFocused();
  });

  test("makes background content inert", async ({ mount, page }) => {
    const component = await mount("Drawer/Dismissible");
    const openButton = component.getByRole("button", { name: "Open Drawer" });
    await openButton.click();

    await expect
      .poll(() =>
        openButton.evaluate((element) => !!element.closest("[inert]")),
      )
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect
      .poll(() => openButton.evaluate((element) => !element.closest("[inert]")))
      .toBe(true);
  });

  test("has no Axe violations while open", async ({ mount, page }) => {
    const component = await mount("Drawer/Dismissible");
    await component.getByRole("button", { name: "Open Drawer" }).click();
    await expectNoAxeViolations(page);
  });
});
