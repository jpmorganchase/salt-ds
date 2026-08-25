import { composeStories } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as dialogStories from "~stories/dialog/dialog.stories";

const { Default, Preheader, LongContent, LongContentWithAriaLabel } =
  composeStories(dialogStories);

afterEach(async () => {
  vi.restoreAllMocks();
  await page.viewport(1280, 1024);
});

async function renderAndOpen(children: ReactNode) {
  await renderWithSalt(children);
  await page.getByRole("button", { name: "Open dialog" }).click();
  await expect.element(page.getByRole("dialog")).toBeVisible();
}

function dismissViaScrim() {
  const scrim = document.querySelector<HTMLElement>(".saltScrim");
  if (!scrim) throw new Error("Dialog scrim missing");
  scrim.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      button: 0,
      composed: true,
      pointerType: "mouse",
    }),
  );
}

describe("GIVEN a Dialog", () => {
  it("renders its header, content, actions, accent, and animation", async () => {
    await renderAndOpen(<Default />);
    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toHaveClass("saltDialog-enterAnimation");
    for (const selector of [
      ".saltDialogHeader",
      ".saltDialogHeader-header",
      ".saltDialogHeader-withAccent",
      ".saltDialogContent",
      ".saltDialogActions",
    ])
      expect(document.querySelector(selector)).toBeVisible();
  });

  it("uses medium size by default", async () => {
    await page.viewport(1921, 900);
    await renderAndOpen(<Default />);
    await expect
      .element(page.getByRole("dialog"))
      .toHaveClass("saltDialog-medium-xl");
  });

  it("renders a preheader", async () => {
    await renderAndOpen(<Preheader />);
    await expect.element(page.getByText("I am a preheader")).toBeVisible();
  });

  it("omits aria-labelledby when no header is provided", async () => {
    await renderAndOpen(<LongContentWithAriaLabel />);
    await expect
      .element(page.getByRole("dialog"))
      .not.toHaveAttribute("aria-labelledby");
  });

  it("supports disabling the scrim", async () => {
    await renderAndOpen(<Default disableScrim />);
    expect(document.querySelector(".saltScrim")).not.toBeInTheDocument();
  });

  it("disableDismiss ignores the scrim but still permits Escape", async () => {
    await renderAndOpen(<Default disableDismiss />);
    dismissViaScrim();
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([
    [1921, "large", "saltDialog-large-xl"],
    [600, "small", "saltDialog-small-sm"],
  ] as const)(
    "uses the %s px breakpoint size",
    async (width, size, expectedClass) => {
      await page.viewport(width, 900);
      await renderAndOpen(<Default size={size} />);
      await expect.element(page.getByRole("dialog")).toHaveClass(expectedClass);
    },
  );

  it("closes from the close button without duplicate unmount work", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await renderAndOpen(<Default />);
    const callCount = consoleSpy.mock.calls.length;
    await page.getByLabelText("Close dialog").click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledTimes(callCount + 1);
  });

  it("closes on Escape", async () => {
    await renderAndOpen(<Default />);
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes from the scrim", async () => {
    await renderAndOpen(<Default />);
    dismissViaScrim();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("traps focus", async () => {
    await renderAndOpen(<Default />);
    const focusOrder = ["Close dialog", "Cancel", "Previous", "Next"];
    for (const name of focusOrder) {
      await expect.element(page.getByRole("button", { name })).toHaveFocus();
      await userEvent.tab();
    }
    await expect
      .element(page.getByRole("button", { name: "Close dialog" }))
      .toHaveFocus();
  });

  it("supports initialFocus", async () => {
    await renderAndOpen(<Default initialFocus={3} />);
    await expect
      .element(page.getByRole("button", { name: "Next" }))
      .toHaveFocus();
  });

  it("keeps non-overflowing content out of the tab order", async () => {
    await renderAndOpen(<Default />);
    const content = document.querySelector(".saltDialogContent-inner");
    expect(content).not.toHaveAttribute("role");
    expect(content).not.toHaveAttribute("tabindex");
    expect(content).not.toHaveAttribute("aria-labelledby");
  });

  it("uses its title as the accessible name", async () => {
    await renderAndOpen(<Default />);
    await expect
      .element(
        page.getByRole("dialog", {
          name: "Congratulations! You have created a Dialog.",
        }),
      )
      .toBeVisible();
  });

  it("makes background content inert while open", async () => {
    await renderWithSalt(<Default />);
    const trigger = page.getByRole("button", { name: "Open dialog" });
    await trigger.click();
    await expect
      .poll(() => trigger.element().closest("[inert]") !== null)
      .toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect
      .poll(() => trigger.element().closest("[inert]") === null)
      .toBe(true);
  });

  it("marks vertically overflowing content", async () => {
    await renderAndOpen(<LongContent />);
    expect(
      document.querySelector(".saltDialogContent-overflow"),
    ).toBeInTheDocument();
  });

  it("permits overriding the dialog id", async () => {
    await renderAndOpen(<Default id="user-provided-id" />);
    await expect
      .element(page.getByRole("dialog"))
      .toHaveAttribute("id", "user-provided-id");
  });

  it("uses idProp for the header and aria-labelledby", async () => {
    await renderAndOpen(<Default idProp="user-provided-header-id" />);
    await expect
      .element(page.getByRole("dialog"))
      .toHaveAttribute("aria-labelledby", "user-provided-header-id");
    expect(
      document.querySelector("h2.saltDialogHeader-header"),
    ).toHaveAttribute("id", "user-provided-header-id");
  });
});

describe("GIVEN a Dialog with scrollable content", () => {
  it("makes the content an accessible focusable region", async () => {
    await renderAndOpen(<LongContent />);
    const region = page.getByRole("region", {
      name: "Congratulations! You have created a Dialog.",
    });
    await expect.element(region).toHaveAttribute("tabindex", "0");
    await expect.element(region).toHaveAttribute("aria-labelledby");
  });

  it("uses a provided aria-label for dialog and region", async () => {
    await renderAndOpen(<LongContentWithAriaLabel />);
    await expect
      .element(page.getByRole("dialog", { name: "Aria labelled dialog" }))
      .toBeVisible();
    await expect
      .element(page.getByRole("region", { name: "Aria labelled dialog" }))
      .toBeVisible();
  });
});
