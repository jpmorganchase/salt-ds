import { composeStories } from "@storybook/react-vite";
import { version } from "react";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { mouse } from "~browser-test-utils/pointer";
import { renderWithSalt } from "~browser-test-utils/render";
import * as splitterStories from "../../../stories/react-resizable-panels-theme.stories";

const { Horizontal, Variant } = composeStories(splitterStories);

// react-resizable-panels v4 requires React 18+.
const isReact18OrLater = Number.parseInt(version, 10) >= 18;

function getBackground(element: Element, pseudoElement?: string) {
  return getComputedStyle(element, pseudoElement).backgroundColor;
}

function getCenter(element: HTMLElement) {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
}

describe.skipIf(!isReact18OrLater)(
  "Given react-resizable-panels v4 with the Salt theme",
  () => {
    it.each([
      {
        variant: "default",
        Story: Horizontal,
        separatorName: "Resize Left/Center",
      },
      {
        variant: "secondary",
        Story: Variant,
        separatorName: "Resize left and center panels",
      },
      {
        variant: "tertiary",
        Story: Variant,
        separatorName: "Resize center and right panels",
      },
    ])(
      "shows distinct active styles while dragging a $variant separator",
      async ({ Story, separatorName }) => {
        await renderWithSalt(<Story />);
        const separator = page
          .getByRole("separator", { name: separatorName })
          .element() as HTMLElement;
        const defaultBackground = getBackground(separator);
        const defaultDot = getBackground(separator, "::after");

        const { x, y } = getCenter(separator);
        await mouse.move({ x, y });
        await expect
          .element(separator)
          .toHaveAttribute("data-separator", "hover");
        await expect
          .poll(() => getBackground(separator))
          .not.toBe(defaultBackground);
        const hoverBackground = getBackground(separator);

        await mouse.down({ x, y });
        await mouse.move({ x: x + 10, y });

        try {
          await expect
            .element(separator)
            .toHaveAttribute("data-separator", "active");
          await expect
            .poll(() => getBackground(separator))
            .not.toBe(hoverBackground);
          expect(getBackground(separator)).not.toBe(defaultBackground);
          expect(getBackground(separator, "::after")).not.toBe(defaultDot);
        } finally {
          await mouse.up({ x: x + 10, y });
          await mouse.move({ x: 4, y: 4 });
        }
      },
    );

    it("changes the background while hovering a separator", async () => {
      await renderWithSalt(<Horizontal />);
      const separator = page
        .getByRole("separator", { name: "Resize Left/Center" })
        .element() as HTMLElement;
      const defaultBackground = getBackground(separator);

      await mouse.move(getCenter(separator));
      await expect
        .element(separator)
        .toHaveAttribute("data-separator", "hover");
      await expect
        .poll(() => getBackground(separator))
        .not.toBe(defaultBackground);

      await mouse.move({ x: 4, y: 4 });

      await expect.poll(() => getBackground(separator)).toBe(defaultBackground);
    });

    it("keeps the resting background when a separator is focused with the keyboard", async () => {
      await renderWithSalt(<Horizontal />);
      const separator = page
        .getByRole("separator", { name: "Resize Left/Center" })
        .element() as HTMLElement;
      const defaultBackground = getBackground(separator);

      await userEvent.tab();

      await expect.element(separator).toHaveFocus();
      await expect
        .element(separator)
        .toHaveAttribute("data-separator", "focus");
      expect(getBackground(separator)).toBe(defaultBackground);
    });

    it("looks hovered without a focus ring after a drag ends over a separator", async () => {
      await renderWithSalt(<Horizontal />);
      const separator = page
        .getByRole("separator", { name: "Resize Left/Center" })
        .element() as HTMLElement;
      const defaultBackground = getBackground(separator);

      const { x, y } = getCenter(separator);
      await mouse.move({ x, y });
      await expect
        .element(separator)
        .toHaveAttribute("data-separator", "hover");
      await expect
        .poll(() => getBackground(separator))
        .not.toBe(defaultBackground);
      const hoverBackground = getBackground(separator);

      await mouse.down({ x, y });
      await mouse.move({ x: x + 20, y });
      await mouse.up({ x: x + 20, y });

      await expect.element(separator).toHaveFocus();
      await expect
        .element(separator)
        .toHaveAttribute("data-separator", "focus");
      await expect.poll(() => getBackground(separator)).toBe(hoverBackground);
      expect(getComputedStyle(separator).outlineStyle).toBe("none");

      await mouse.move({ x: 4, y: 4 });

      await expect.poll(() => getBackground(separator)).toBe(defaultBackground);
    });
  },
);
