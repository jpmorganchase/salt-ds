import {
  Button,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  Text,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";

import { renderWithSalt } from "~browser-test-utils/render";
import * as overlayStories from "~stories/overlay/overlay.stories";

const composedStories = composeStories(overlayStories);
const {
  Default,
  Placement,
  CloseButton,
  HideArrow,
  LongContent,
  LongHeader,
  WithSections,
  WithTooltip,
} = composedStories;
const trigger = () => page.getByRole("button", { name: /Show Overlay/i });
const rectOf = (root: Element, selector: string) => {
  const section = root.querySelector(selector);
  if (!section) throw new Error(`${selector} was not rendered`);
  return section.getBoundingClientRect();
};

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

  describe("WHEN an OverlayHeader is used", () => {
    it("THEN it should name the overlay from the header", async () => {
      await renderWithSalt(<CloseButton />);
      await trigger().click();

      const dialog = page.getByRole("dialog");
      await expect.element(dialog).toHaveAccessibleName("Title");
      await expect
        .element(page.getByRole("heading", { level: 2 }))
        .toBeVisible();
    });

    it("THEN it should describe the overlay from the description", async () => {
      await renderWithSalt(<WithSections />);
      await trigger().click();

      const dialog = page.getByRole("dialog");
      await expect.element(dialog).toHaveAccessibleName("Review changes");
      await expect
        .element(dialog)
        .toHaveAccessibleDescription("Account updates are pending");
    });

    it("THEN it should merge a provided aria-labelledby with the header", async () => {
      await renderWithSalt(
        <Overlay open>
          <OverlayTrigger>
            <Button>Show Overlay</Button>
          </OverlayTrigger>
          <OverlayPanel aria-labelledby="overlay-context">
            <OverlayHeader header="Title" />
            <OverlayPanelContent>
              <Text id="overlay-context">Billing</Text>
            </OverlayPanelContent>
          </OverlayPanel>
        </Overlay>,
      );

      await expect
        .element(page.getByRole("dialog"))
        .toHaveAccessibleName("Billing Title");
    });

    it("THEN it should not label the overlay when the header only has actions", async () => {
      await renderWithSalt(
        <Overlay open>
          <OverlayTrigger>
            <Button>Show Overlay</Button>
          </OverlayTrigger>
          <OverlayPanel aria-label="Notifications">
            <OverlayHeader actions={<Button>Close</Button>} />
            <OverlayPanelContent>
              <Text>Content of Overlay</Text>
            </OverlayPanelContent>
          </OverlayPanel>
        </Overlay>,
      );

      const dialog = page.getByRole("dialog");
      await expect.element(dialog).toHaveAccessibleName("Notifications");
      await expect.element(dialog).not.toHaveAccessibleDescription();
      await expect.element(page.getByRole("heading")).not.toBeInTheDocument();
    });

    it("THEN it should keep its name after closing and reopening", async () => {
      await renderWithSalt(<CloseButton />);
      await trigger().click();
      await expect
        .element(page.getByRole("dialog"))
        .toHaveAccessibleName("Title");
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await trigger().click();
      await expect
        .element(page.getByRole("dialog"))
        .toHaveAccessibleName("Title");
    });
  });

  const placementCases = [
    ["top", "y", "greater"] as const,
    ["right", "x", "less"] as const,
    ["bottom", "y", "less"] as const,
    ["left", "x", "greater"] as const,
  ];

  for (const [placement, axis, comparison] of placementCases) {
    describe(`WHEN mounted ${placement}`, () => {
      it(`THEN it should appear on ${placement} of trigger element`, async () => {
        await renderWithSalt(<Placement placement={placement} />);
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

    it("THEN it should show dividers at the available scroll boundaries", async () => {
      await renderWithSalt(<WithSections />);
      await trigger().click();

      const content = document.querySelector<HTMLElement>(
        ".saltOverlayPanelContent-container",
      );
      if (!content) {
        throw new Error("Overlay panel content was not rendered");
      }

      await expect
        .poll(() =>
          content.classList.contains("saltOverlayPanelContent-scroll-bottom"),
        )
        .toBe(true);

      content.scrollTop = content.scrollHeight;
      content.dispatchEvent(new Event("scroll", { bubbles: true }));

      await expect
        .poll(() =>
          content.classList.contains("saltOverlayPanelContent-scroll-top"),
        )
        .toBe(true);
      await expect
        .poll(() =>
          content.classList.contains("saltOverlayPanelContent-scroll-bottom"),
        )
        .toBe(false);

      content.style.height = "80px";
      await expect
        .poll(() =>
          content.classList.contains("saltOverlayPanelContent-scroll-bottom"),
        )
        .toBe(true);
    });

    it("THEN it should keep the header and footer in place while the content scrolls", async () => {
      await renderWithSalt(<WithSections />);
      await trigger().click();

      const panel = page.getByRole("dialog").element();
      const content = panel.querySelector<HTMLElement>(
        ".saltOverlayPanelContent-container",
      );
      if (!content) {
        throw new Error("Overlay panel content was not rendered");
      }

      await expect
        .poll(() => content.scrollHeight)
        .toBeGreaterThan(content.clientHeight);

      const headerTop = rectOf(panel, ".saltOverlayHeader").top;
      const footerBottom = rectOf(panel, ".saltOverlayFooter").bottom;
      expect(footerBottom).toBeLessThanOrEqual(
        panel.getBoundingClientRect().bottom,
      );

      content.scrollTop = content.scrollHeight;
      await expect.poll(() => content.scrollTop).toBeGreaterThan(0);

      expect(rectOf(panel, ".saltOverlayHeader").top).toBeCloseTo(headerTop, 1);
      expect(rectOf(panel, ".saltOverlayFooter").bottom).toBeCloseTo(
        footerBottom,
        1,
      );
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

  it("keeps reflowed content within the viewport and scrollable", async () => {
    await page.viewport(320, 200);
    await renderWithSalt(<LongHeader />);
    await trigger().click();

    const panel = page.getByRole("dialog").element();
    const content = panel.querySelector<HTMLElement>(
      ".saltOverlayPanelContent-container",
    );
    if (!content) {
      throw new Error("Overlay panel content was not rendered");
    }

    expect(panel.getBoundingClientRect().width).toBeLessThanOrEqual(
      window.innerWidth,
    );
    expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(
      window.innerHeight,
    );
    await expect
      .poll(() => content.scrollHeight)
      .toBeGreaterThan(content.clientHeight);

    const headerTop = rectOf(panel, ".saltOverlayHeader").top;
    content.scrollTop = content.scrollHeight;
    await expect.poll(() => content.scrollTop).toBeGreaterThan(0);

    const header = rectOf(panel, ".saltOverlayHeader");
    expect(header.top).toBeCloseTo(headerTop, 1);
    expect(header.bottom).toBeLessThanOrEqual(
      panel.getBoundingClientRect().bottom,
    );
  });
});
