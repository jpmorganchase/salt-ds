import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import { PreferencesDialog } from "../../site/src/examples/patterns/preferences-dialog";

afterEach(async () => {
  await page.viewport(1280, 1024);
});

describe("Preferences section navigation", () => {
  it("moves focus into collapsed settings and restores the category on Back", async () => {
    await page.viewport(390, 844);
    await renderWithSalt(<PreferencesDialog />);
    await page.getByRole("button", { name: "Open preferences" }).click();
    await expect
      .element(page.getByRole("button", { name: "Account", exact: true }))
      .toHaveFocus();
    const general = page.getByRole("button", { name: "General", exact: true });
    const heading = page.getByRole("heading", { name: "General", exact: true });
    const back = page.getByRole("button", { name: "Back", exact: true });

    await expect.element(general).toBeVisible();
    general.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect.element(heading).toHaveFocus();
    await expect.element(general).not.toBeInTheDocument();
    await userEvent.tab();
    await expect.element(page.getByRole("switch")).toHaveFocus();

    back.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect.element(general).toHaveFocus();
    await expect.element(heading).not.toBeInTheDocument();

    await userEvent.keyboard(" ");
    await expect.element(heading).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(page.getByRole("button", { name: "Open preferences" }))
      .toHaveFocus();
  });

  it("keeps focus on a category while both navigation and settings remain visible", async () => {
    await page.viewport(1280, 1024);
    await renderWithSalt(<PreferencesDialog />);
    const opener = page.getByRole("button", { name: "Open preferences" });
    opener.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(page.getByRole("button", { name: "Account", exact: true }))
      .toHaveFocus();
    const general = page.getByRole("button", { name: "General", exact: true });
    await expect.element(general).toBeVisible();
    general.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(page.getByRole("heading", { name: "General", exact: true }))
      .toBeVisible();
    await expect.element(general).toHaveFocus();
    await expect
      .element(page.getByRole("button", { name: "Back", exact: true }))
      .not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(page.getByRole("dialog", { name: "Preferences", exact: true }))
      .not.toBeInTheDocument();
    await expect.element(opener).toHaveFocus();
  });
});
