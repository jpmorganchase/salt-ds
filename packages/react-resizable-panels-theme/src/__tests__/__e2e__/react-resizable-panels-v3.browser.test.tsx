import resizablePanelsCss from "@salt-ds/react-resizable-panels-theme/index.css";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels-v3";
import { expect, it } from "vitest";
import { page } from "vitest/browser";
import { mouse } from "~browser-test-utils/pointer";
import { renderWithSalt } from "~browser-test-utils/render";

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

function LegacyPanels({
  direction = "horizontal",
  collapsedMiddle = false,
}: {
  direction?: "horizontal" | "vertical";
  collapsedMiddle?: boolean;
}) {
  useComponentCssInjection({
    css: resizablePanelsCss,
    testId: "salt-resizable-panels-theme",
  });

  const borderClass =
    direction === "horizontal"
      ? "resize-handle-salt-border-left resize-handle-salt-border-right"
      : "resize-handle-salt-border-top resize-handle-salt-border-bottom";

  return (
    <div
      className="react-resizable-panels-theme-salt"
      style={{ width: 480, height: 240 }}
    >
      <PanelGroup direction={direction}>
        <Panel defaultSize={50} minSize={0}>
          First
        </Panel>
        <PanelResizeHandle
          aria-label="Resize first and middle panels"
          className={borderClass}
        />
        {collapsedMiddle && (
          <Panel defaultSize={0} minSize={0}>
            Middle
          </Panel>
        )}
        {collapsedMiddle && (
          <PanelResizeHandle
            aria-label="Resize middle and last panels"
            className={borderClass}
          />
        )}
        <Panel defaultSize={50} minSize={0}>
          Last
        </Panel>
      </PanelGroup>
    </div>
  );
}

it("styles a react-resizable-panels v3 separator when hovered and dragged", async () => {
  await renderWithSalt(<LegacyPanels />);

  const separator = page
    .getByRole("separator", { name: "Resize first and middle panels" })
    .element() as HTMLElement;
  const { left, top, width, height } = separator.getBoundingClientRect();
  const point = { x: left + width / 2, y: top + height / 2 };
  const hoverBackground = resolveColor(
    separator,
    "--splitHandle-background-hover",
  );
  const activeBackground = resolveColor(
    separator,
    "--splitHandle-background-active",
  );

  await mouse.move(point);
  await expect
    .poll(() => separator.getAttribute("data-resize-handle-state"))
    .toBe("hover");
  await expect
    .poll(() => getComputedStyle(separator).backgroundColor)
    .toBe(hoverBackground);

  await mouse.down(point);
  await mouse.move({ x: point.x + 20, y: point.y });

  try {
    await expect
      .poll(() => separator.getAttribute("data-resize-handle-state"))
      .toBe("drag");
    await expect
      .poll(() => getComputedStyle(separator).backgroundColor)
      .toBe(activeBackground);
  } finally {
    await mouse.up({ x: point.x + 20, y: point.y });
  }
});

it.each([
  { direction: "horizontal" as const, margin: "marginLeft" as const },
  { direction: "vertical" as const, margin: "marginTop" as const },
])(
  "overlaps adjacent v3 separators when a $direction panel is zero",
  async ({ direction, margin }) => {
    await renderWithSalt(
      <LegacyPanels direction={direction} collapsedMiddle />,
    );

    const separator = page
      .getByRole("separator", { name: "Resize middle and last panels" })
      .element() as HTMLElement;
    await expect.poll(() => getComputedStyle(separator)[margin]).toBe("-1px");
  },
);
