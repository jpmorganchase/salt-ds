import { composeStories } from "@storybook/react-vite";
import { useRef, version } from "react";
import {
  Group,
  Panel,
  type PanelImperativeHandle,
  Separator,
} from "react-resizable-panels";
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

function PanelsWithZeroSizedPanel({
  orientation,
  collapsedIndex,
}: {
  orientation: "horizontal" | "vertical";
  collapsedIndex: number;
}) {
  const panelRef = useRef<PanelImperativeHandle>(null);
  const sizes = ["50%", "50%", "50%"];
  sizes[collapsedIndex] = "0%";
  const borderClass =
    orientation === "horizontal"
      ? "resize-handle-salt-border-left resize-handle-salt-border-right"
      : "resize-handle-salt-border-top resize-handle-salt-border-bottom";

  function renderPanel(index: number) {
    return (
      <Panel
        id={`panel-${index}`}
        defaultSize={sizes[index]}
        minSize="0%"
        panelRef={index === collapsedIndex ? panelRef : undefined}
      >
        Panel {index}
      </Panel>
    );
  }

  return (
    <div className="react-resizable-panels-theme-salt">
      <div style={{ width: 480, height: 240 }}>
        <Group orientation={orientation}>
          {renderPanel(0)}
          <Separator
            aria-label="Resize first and middle panels"
            className={borderClass}
          />
          {renderPanel(1)}
          <Separator
            aria-label="Resize middle and last panels"
            className={borderClass}
          />
          {renderPanel(2)}
        </Group>
      </div>
      <button type="button" onClick={() => panelRef.current?.resize("20%")}>
        Expand collapsed panel
      </button>
    </div>
  );
}

const zeroSizeCases = [
  {
    orientation: "horizontal" as const,
    collapsedIndex: 0,
    handle: 0,
    margin: "marginLeft" as const,
    size: "width" as const,
  },
  {
    orientation: "horizontal" as const,
    collapsedIndex: 1,
    handle: 1,
    margin: "marginLeft" as const,
    size: "width" as const,
  },
  {
    orientation: "horizontal" as const,
    collapsedIndex: 2,
    handle: 1,
    margin: "marginRight" as const,
    size: "width" as const,
  },
  {
    orientation: "vertical" as const,
    collapsedIndex: 0,
    handle: 0,
    margin: "marginTop" as const,
    size: "height" as const,
  },
  {
    orientation: "vertical" as const,
    collapsedIndex: 1,
    handle: 1,
    margin: "marginTop" as const,
    size: "height" as const,
  },
  {
    orientation: "vertical" as const,
    collapsedIndex: 2,
    handle: 1,
    margin: "marginBottom" as const,
    size: "height" as const,
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

        await mouse.down({ x, y });
        await mouse.move({ x: x + 10, y });

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
          await mouse.up({ x: x + 10, y });
          await mouse.move({ x: 4, y: 4 });
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
        await mouse.move({ x, y });

        await expect
          .poll(() => separator.getAttribute("data-separator"))
          .toBe("hover");
        await expect
          .poll(() => getComputedStyle(separator).backgroundColor)
          .toBe(hoverBackground);

        await mouse.move({ x: 4, y: 4 });

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

      await mouse.down({ x, y });
      await mouse.move({ x: x + 20, y });
      await mouse.up({ x: x + 20, y });

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

      await mouse.move({ x: 4, y: 4 });

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

    it.each(zeroSizeCases)(
      "keeps $orientation separators styled when panel $collapsedIndex reaches zero",
      async ({ orientation, collapsedIndex, handle, margin, size }) => {
        const { container } = await renderWithSalt(
          <PanelsWithZeroSizedPanel
            orientation={orientation}
            collapsedIndex={collapsedIndex}
          />,
        );
        const panel =
          container.querySelectorAll<HTMLElement>("[data-panel]")[
            collapsedIndex
          ];
        const separator = page.getByRole("separator").nth(handle).element();
        const borderStyle =
          orientation === "horizontal" ? "borderLeftStyle" : "borderTopStyle";

        await expect
          .poll(() => Math.round(panel.getBoundingClientRect()[size]))
          .toBe(0);
        expect(panel.hasAttribute("data-panel-collapsed")).toBe(false);
        await expect
          .poll(() => getComputedStyle(separator)[margin])
          .toBe("0px");
        expect(getComputedStyle(separator)[borderStyle]).toBe("solid");

        await page
          .getByRole("button", { name: "Expand collapsed panel" })
          .click();

        await expect
          .poll(() => Math.round(panel.getBoundingClientRect()[size]))
          .toBeGreaterThan(0);
        await expect
          .poll(() => getComputedStyle(separator)[margin])
          .toBe("0px");
      },
    );
  },
);
