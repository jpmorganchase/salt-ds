import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as drawerStories from "~stories/drawer/drawer.stories";

const {
  Default,
  OptionalCloseAction,
  InitialFocusIndex,
  InitialFocusRef,
  WithHeader,
  WithHeaderNoAccent,
  WithHeaderStatus,
} = composeStories(drawerStories);

afterEach(() => {
  vi.restoreAllMocks();
});

function dismissViaScrim() {
  page
    .getByTestId("scrim")
    .element()
    .dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        composed: true,
        pointerType: "mouse",
      }),
    );
}

describe("GIVEN a Drawer", () => {
  it("closes from the close action and scrim", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await renderWithSalt(<Default />);

    await page.getByRole("button", { name: "Open Primary Drawer" }).click();
    await expect.element(page.getByTestId("scrim")).toBeInTheDocument();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Close Drawer" }))
      .toHaveFocus();
    const callCount = consoleSpy.mock.calls.length;

    await page.getByRole("button", { name: "Close Drawer" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledTimes(callCount + 1);

    await page.getByRole("button", { name: "Open Secondary Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    dismissViaScrim();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("dismisses on Escape", async () => {
    await renderWithSalt(<Default disableScrim />);
    await page.getByRole("button", { name: "Open Primary Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect.element(page.getByTestId("scrim")).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("traps focus when a close action is present", async () => {
    await renderWithSalt(<Default />);
    const closeButton = page.getByRole("button", { name: "Close Drawer" });
    await page.getByRole("button", { name: "Open Primary Drawer" }).click();
    await expect.element(closeButton).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(closeButton).toHaveFocus();
  });

  it("makes background content inert", async () => {
    await renderWithSalt(<Default disableScrim />);
    const openButton = page.getByRole("button", {
      name: "Open Primary Drawer",
    });
    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect
      .poll(() => openButton.element().closest("[inert]") !== null)
      .toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect
      .poll(() => openButton.element().closest("[inert]") === null)
      .toBe(true);
  });

  it("closes a drawer without a close button from the scrim and Escape", async () => {
    await renderWithSalt(<OptionalCloseAction />);
    const openButton = page.getByRole("button", { name: "Open Drawer" });

    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    dismissViaScrim();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await openButton.click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("traps focus without a close button", async () => {
    await renderWithSalt(<OptionalCloseAction />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const firstField = page.getByRole("textbox", { name: "House no." });
    await expect.element(firstField).toHaveFocus();
    for (let index = 0; index < 7; index += 1) {
      await userEvent.tab();
    }
    await expect.element(firstField).toHaveFocus();
  });

  it("focuses the first focusable element", async () => {
    await renderWithSalt(<OptionalCloseAction />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect
      .element(page.getByRole("textbox", { name: "House no." }))
      .toHaveFocus();
  });

  it("supports an action configured to close the drawer", async () => {
    await renderWithSalt(<OptionalCloseAction />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Submit" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("takes its accessible name from the header", async () => {
    await renderWithSalt(<WithHeaderNoAccent />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect
      .element(page.getByRole("dialog", { name: "Cash breaks" }))
      .toBeVisible();
  });

  it("includes the preheader in the accessible name", async () => {
    await renderWithSalt(<WithHeader />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect
      .element(page.getByRole("dialog", { name: /Settlements - Nostros/ }))
      .toBeVisible();
  });

  it("closes from a close button inside the header", async () => {
    await renderWithSalt(<WithHeader />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close Drawer" }).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a status indicator in place of the accent bar", async () => {
    await renderWithSalt(<WithHeaderStatus />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    const heading = page.getByRole("heading", { name: "Can't move file" });
    await expect.element(heading).toBeVisible();
    const header = heading.element().closest(".saltDrawerHeader");
    expect(header?.classList.contains("saltDrawerHeader-warning")).toBe(true);
    expect(header?.classList.contains("saltDrawerHeader-withAccent")).toBe(
      false,
    );
  });

  it.each([
    ["tabbable index", InitialFocusIndex],
    ["provided ref", InitialFocusRef],
  ] as const)("supports initial focus by %s", async (_name, Story) => {
    await renderWithSalt(<Story />);
    await page.getByRole("button", { name: "Open Drawer" }).click();
    await expect
      .element(page.getByRole("textbox", { name: "Third" }))
      .toHaveFocus();
  });
});
