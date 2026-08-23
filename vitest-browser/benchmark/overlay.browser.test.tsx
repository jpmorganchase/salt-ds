import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as overlayStories from "~stories/overlay/overlay.stories";

import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(overlayStories);
const {
  Default,
  Right,
  Bottom,
  Left,
  CloseButton,
  HideArrow,
  LongContent,
  WithTooltip,
} = composedStories;
const trigger = () => page.getByRole("button", { name: /Show Overlay/i });

describe("GIVEN an Overlay", () => {
  checkAccessibility(composedStories);

  describe("WHEN rendered", () => {
    it("THEN it should show Overlay on trigger element press", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("dialog")).toBeVisible();
    });

    it("THEN it should dismiss on Esc key press", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("dialog")).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await expect.element(trigger()).toHaveFocus();
    });

    it("THEN it should focus into the overlay when opened", async () => {
      await renderWithSalt(<CloseButton />);
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("dialog")).toBeVisible();
      await expect
        .element(page.getByRole("button", { name: /Close Overlay/i }))
        .toHaveFocus();
      await userEvent.tab();
    });

    it("THEN it should trap focus within Overlay once opened", async () => {
      await renderWithSalt(<CloseButton />);
      await trigger().click();
      await expect.element(page.getByRole("dialog")).toBeVisible();
      const close = page.getByRole("button", { name: /Close Overlay/i });
      await expect.element(close).toHaveFocus();
      await userEvent.tab();
      await expect
        .element(page.getByRole("button", { name: /Hover me/i }))
        .toHaveFocus();
      await userEvent.tab();
      await expect.element(close).toHaveFocus();
    });

    it("THEN it should make background content inert", async () => {
      await renderWithSalt(<CloseButton />);
      await trigger().click();
      await expect.element(page.getByRole("dialog")).toBeVisible();
      expect(
        (await trigger().element()).closest("[inert]"),
      ).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      expect(
        (await trigger().element()).closest("[inert]"),
      ).not.toBeInTheDocument();
    });
  });

  const placementCases = [
    ["top", Default, "y", "greater"] as const,
    ["right", Right, "x", "less"] as const,
    ["bottom", Bottom, "y", "less"] as const,
    ["left", Left, "x", "greater"] as const,
  ];

  for (const [placement, Story, axis, comparison] of placementCases) {
    describe(`WHEN mounted ${placement}`, () => {
      it(`THEN it should appear on ${placement} of trigger element`, async () => {
        await renderWithSalt(<Story />);
        await trigger().click();
        const dialog = page.getByRole("dialog");
        const overlayTrigger = page.getByText(/Show Overlay/i);
        await expect.element(dialog).toBeVisible();
        await expect
          .poll(() => {
            const dialogPosition = dialog.element().getBoundingClientRect()[
              axis
            ];
            const triggerPosition = overlayTrigger
              .element()
              .getBoundingClientRect()[axis];
            return comparison === "greater"
              ? triggerPosition > dialogPosition
              : triggerPosition < dialogPosition;
          })
          .toBe(true);
      });
    });
  }

  describe("WHEN hideArrow", () => {
    it('THEN the arrow is not displayed when "hideArrow=true"', async () => {
      await renderWithSalt(<HideArrow />);
      await trigger().click();
      await expect.element(page.getByRole("dialog")).toBeVisible();
      expect(
        document.querySelector(".saltOverlayPanel-arrow"),
      ).not.toBeInTheDocument();
    });
  });

  describe("WHEN a Close Button is used", () => {
    it("THEN it should remain open until outside Overlay click or close button click", async () => {
      const onOpenChangeSpy = vi.fn();
      await renderWithSalt(<CloseButton onOpenChange={onOpenChangeSpy} />);
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("dialog")).toBeVisible();
      expect(onOpenChangeSpy).toHaveBeenCalledTimes(1);
      await page.getByRole("button", { name: /Close Overlay/i }).click();
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await trigger().click();
      await userEvent.click(document.body);
      await expect.poll(() => onOpenChangeSpy.mock.calls.length).toBe(3);
    });
  });

  describe("WHEN overflowing content is detected", () => {
    it("THEN it should add padding to the right of the scroll bar", async () => {
      await renderWithSalt(<LongContent />);
      await trigger().click();
      expect(
        document.querySelector(
          '[role="dialog"] div.saltOverlayPanelContent-overflow',
        ),
      ).toBeInTheDocument();
    });
  });

  it("should support tooltip on overlay triggers", async () => {
    await renderWithSalt(
      <>
        <WithTooltip />
        <button type="button">After overlay trigger</button>
      </>,
    );
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await userEvent.tab();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After overlay trigger" }))
      .toHaveFocus();
    await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
    const tooltipTrigger = page.getByRole("button", { name: "Show content" });
    await tooltipTrigger.hover();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await tooltipTrigger.click();
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
  });
});
