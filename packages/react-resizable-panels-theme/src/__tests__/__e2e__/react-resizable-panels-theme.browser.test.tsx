import { composeStories } from "@storybook/react-vite";
import { version } from "react";
import { describe, expect, it } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as splitterStories from "../../../stories/react-resizable-panels-theme.stories";

const { Horizontal, Variant } = composeStories(splitterStories);

// react-resizable-panels v4 requires React 18+.
const isReact18OrLater = Number.parseInt(version, 10) >= 18;

type CdpSession = {
  send(method: string, params: Record<string, unknown>): Promise<unknown>;
};

async function dispatchMouse(
  type: "mouseMoved" | "mousePressed" | "mouseReleased",
  x: number,
  y: number,
  buttons = 0,
) {
  await (cdp() as CdpSession).send("Input.dispatchMouseEvent", {
    type,
    x,
    y,
    button: type === "mouseMoved" ? "none" : "left",
    buttons,
    clickCount: type === "mouseMoved" ? 0 : 1,
  });
}

function resolveColor(element: HTMLElement, customProperty: string) {
  const probe = document.createElement("div");
  probe.style.backgroundColor = getComputedStyle(element)
    .getPropertyValue(customProperty)
    .trim();
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

function getCenter(element: HTMLElement) {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
}

const separatorCases = [
  {
    name: "a separator",
    render: () => renderWithSalt(<Horizontal />),
    getSeparator: () =>
      page
        .getByRole("separator", { name: "Resize Left/Center" })
        .element() as HTMLElement,
  },
  {
    name: "a secondary variant separator",
    render: () => renderWithSalt(<Variant />),
    getSeparator: () =>
      page.getByRole("separator").nth(0).element() as HTMLElement,
  },
  {
    name: "a tertiary variant separator",
    render: () => renderWithSalt(<Variant />),
    getSeparator: () =>
      page.getByRole("separator").nth(1).element() as HTMLElement,
  },
];

describe.skipIf(!isReact18OrLater)(
  "GIVEN react-resizable-panels v4 with the Salt theme",
  () => {
    describe.each(separatorCases)("WHEN using $name", (testCase) => {
      it("THEN shows the active styles while dragging", async () => {
        await testCase.render();

        const separator = testCase.getSeparator();
        const defaultBackground = getComputedStyle(separator).backgroundColor;
        const activeBackground = resolveColor(
          separator,
          "--splitHandle-background-active",
        );
        const activeDot = resolveColor(
          separator,
          "--splitHandle-dot-background-active",
        );
        expect(activeBackground).not.toBe(defaultBackground);

        const { x, y } = getCenter(separator);

        await dispatchMouse("mouseMoved", x, y);
        await dispatchMouse("mousePressed", x, y, 1);
        await dispatchMouse("mouseMoved", x + 10, y, 1);

        try {
          await expect
            .poll(() => separator.getAttribute("data-separator"))
            .toBe("active");
          await expect
            .poll(() => getComputedStyle(separator).backgroundColor)
            .toBe(activeBackground);
          expect(getComputedStyle(separator, "::after").backgroundColor).toBe(
            activeDot,
          );
        } finally {
          await dispatchMouse("mouseReleased", x + 10, y);
          await dispatchMouse("mouseMoved", 4, 4);
        }
      });

      it("THEN shows the hover styles when hovered", async () => {
        await testCase.render();

        const separator = testCase.getSeparator();
        const defaultBackground = getComputedStyle(separator).backgroundColor;
        const hoverBackground = resolveColor(
          separator,
          "--splitHandle-background-hover",
        );
        expect(hoverBackground).not.toBe(defaultBackground);

        const { x, y } = getCenter(separator);
        await dispatchMouse("mouseMoved", x, y);

        await expect
          .poll(() => separator.getAttribute("data-separator"))
          .toBe("hover");
        await expect
          .poll(() => getComputedStyle(separator).backgroundColor)
          .toBe(hoverBackground);

        await dispatchMouse("mouseMoved", 4, 4);

        await expect
          .poll(() => getComputedStyle(separator).backgroundColor)
          .toBe(defaultBackground);
      });

      it("THEN shows the focus ring and keeps its background when focused", async () => {
        await testCase.render();

        const separator = testCase.getSeparator();
        const defaultBackground = getComputedStyle(separator).backgroundColor;

        separator.focus();

        await expect.poll(() => document.activeElement).toBe(separator);
        await expect
          .poll(() => separator.getAttribute("data-separator"))
          .toBe("focus");
        await expect
          .poll(() => getComputedStyle(separator).outlineStyle)
          .not.toBe("none");
        expect(getComputedStyle(separator).backgroundColor).toBe(
          defaultBackground,
        );
      });
    });

    it("THEN keeps the hover styles after a drag ends with the pointer over the separator", async () => {
      await renderWithSalt(<Horizontal />);

      const separator = page
        .getByRole("separator", { name: "Resize Left/Center" })
        .element() as HTMLElement;
      const defaultBackground = getComputedStyle(separator).backgroundColor;
      const hoverBackground = resolveColor(
        separator,
        "--splitHandle-background-hover",
      );
      const hoverDot = resolveColor(
        separator,
        "--splitHandle-dot-background-hover",
      );
      expect(hoverBackground).not.toBe(defaultBackground);

      const { left, top, width, height } = separator.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;

      await dispatchMouse("mouseMoved", x, y);
      await dispatchMouse("mousePressed", x, y, 1);
      await dispatchMouse("mouseMoved", x + 20, y, 1);
      await dispatchMouse("mouseReleased", x + 20, y);

      await expect.poll(() => document.activeElement).toBe(separator);
      await expect
        .poll(() => separator.getAttribute("data-separator"))
        .toBe("focus");
      await expect
        .poll(() => getComputedStyle(separator).backgroundColor)
        .toBe(hoverBackground);
      expect(getComputedStyle(separator, "::after").backgroundColor).toBe(
        hoverDot,
      );
      expect(getComputedStyle(separator).outlineStyle).toBe("none");

      await dispatchMouse("mouseMoved", 4, 4);

      await expect
        .poll(() => getComputedStyle(separator).backgroundColor)
        .toBe(defaultBackground);
    });

    it("THEN shows the focus ring without hover styles when focused with the keyboard", async () => {
      await renderWithSalt(<Horizontal />);

      const separator = page.getByRole("separator", {
        name: "Resize Left/Center",
      });
      const element = separator.element() as HTMLElement;
      const defaultBackground = getComputedStyle(element).backgroundColor;

      await userEvent.keyboard("{Tab}");

      await expect.element(separator).toHaveFocus();
      await expect
        .element(separator)
        .toHaveAttribute("data-separator", "focus");
      await expect
        .poll(() => getComputedStyle(element).outlineStyle)
        .not.toBe("none");
      expect(getComputedStyle(element).backgroundColor).toBe(defaultBackground);
    });
  },
);
