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

const focusRingTokens = [
  ["outlineStyle", "--salt-focused-outlineStyle"],
  ["outlineWidth", "--salt-focused-outlineWidth"],
  ["outlineColor", "--salt-focused-outlineColor"],
  ["outlineOffset", "--salt-focused-outlineOffset"],
] as const;

function getOutline(element: Element) {
  const styles = getComputedStyle(element);
  return Object.fromEntries(
    focusRingTokens.map(([property]) => [property, styles[property]]),
  );
}

function resolveFocusRing(element: HTMLElement) {
  const styles = getComputedStyle(element);
  const probe = document.createElement("div");
  for (const [property, token] of focusRingTokens) {
    probe.style[property] = styles.getPropertyValue(token).trim();
  }
  document.body.appendChild(probe);
  const focusRing = getOutline(probe);
  probe.remove();
  return focusRing;
}

function getCenter(element: HTMLElement) {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
}

const separatorCases = [
  {
    name: "a separator",
    Story: Horizontal,
    separatorName: "Resize Left/Center",
    tabStops: 1,
  },
  {
    name: "a secondary variant separator",
    Story: Variant,
    separatorName: "Resize left and center panels",
    tabStops: 1,
  },
  {
    name: "a tertiary variant separator",
    Story: Variant,
    separatorName: "Resize center and right panels",
    tabStops: 2,
  },
];

async function renderSeparator({
  Story,
  separatorName,
}: (typeof separatorCases)[number]) {
  await renderWithSalt(<Story />);
  return page
    .getByRole("separator", { name: separatorName })
    .element() as HTMLElement;
}

describe.skipIf(!isReact18OrLater)(
  "Given react-resizable-panels v4 with the Salt theme",
  () => {
    it.each(separatorCases)(
      "shows the active styles while dragging $name",
      async (testCase) => {
        const separator = await renderSeparator(testCase);
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

        await mouse.down({ x, y });
        await mouse.move({ x: x + 10, y });

        try {
          await expect
            .element(separator)
            .toHaveAttribute("data-separator", "active");
          await expect
            .poll(() => getComputedStyle(separator).backgroundColor)
            .toBe(activeBackground);
          expect(getComputedStyle(separator, "::after").backgroundColor).toBe(
            activeDot,
          );
        } finally {
          await mouse.up({ x: x + 10, y });
          await mouse.move({ x: 4, y: 4 });
        }
      },
    );

    it.each(separatorCases)(
      "shows the hover styles when hovering $name",
      async (testCase) => {
        const separator = await renderSeparator(testCase);
        const defaultBackground = getComputedStyle(separator).backgroundColor;
        const hoverBackground = resolveColor(
          separator,
          "--splitHandle-background-hover",
        );
        expect(hoverBackground).not.toBe(defaultBackground);

        const { x, y } = getCenter(separator);
        await mouse.move({ x, y });

        await expect
          .element(separator)
          .toHaveAttribute("data-separator", "hover");
        await expect
          .poll(() => getComputedStyle(separator).backgroundColor)
          .toBe(hoverBackground);

        await mouse.move({ x: 4, y: 4 });

        await expect
          .poll(() => getComputedStyle(separator).backgroundColor)
          .toBe(defaultBackground);
      },
    );

    it.each(separatorCases)(
      "shows the focus ring without hover styles when $name is focused with the keyboard",
      async (testCase) => {
        const separator = await renderSeparator(testCase);
        const defaultBackground = getComputedStyle(separator).backgroundColor;
        const focusRing = resolveFocusRing(separator);
        expect(focusRing.outlineStyle).not.toBe("none");

        // Programmatic focus() doesn't match :focus-visible in Firefox.
        for (let i = 0; i < testCase.tabStops; i++) {
          await userEvent.tab();
        }

        await expect.element(separator).toHaveFocus();
        await expect
          .element(separator)
          .toHaveAttribute("data-separator", "focus");
        await expect.poll(() => getOutline(separator)).toEqual(focusRing);
        expect(getComputedStyle(separator).backgroundColor).toBe(
          defaultBackground,
        );
      },
    );

    it("keeps the hover styles without a focus ring after a drag ends over a separator", async () => {
      const separator = await renderSeparator(separatorCases[0]);
      const defaultBackground = getComputedStyle(separator).backgroundColor;
      const hoverBackground = resolveColor(
        separator,
        "--splitHandle-background-hover",
      );
      expect(hoverBackground).not.toBe(defaultBackground);

      const { x, y } = getCenter(separator);

      await mouse.down({ x, y });
      await mouse.move({ x: x + 20, y });
      await mouse.up({ x: x + 20, y });

      await expect.element(separator).toHaveFocus();
      await expect
        .element(separator)
        .toHaveAttribute("data-separator", "focus");
      await expect
        .poll(() => getComputedStyle(separator).backgroundColor)
        .toBe(hoverBackground);
      expect(getComputedStyle(separator).outlineStyle).toBe("none");

      await mouse.move({ x: 4, y: 4 });

      await expect
        .poll(() => getComputedStyle(separator).backgroundColor)
        .toBe(defaultBackground);
    });
  },
);
