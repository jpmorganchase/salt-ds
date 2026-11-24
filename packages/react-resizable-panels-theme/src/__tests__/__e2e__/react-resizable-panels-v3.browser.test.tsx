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

function LegacyPanels() {
  useComponentCssInjection({
    css: resizablePanelsCss,
    testId: "salt-resizable-panels-theme",
    window,
  });

  return (
    <div
      className="react-resizable-panels-theme-salt"
      style={{ width: 480, height: 240 }}
    >
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={0}>
          First
        </Panel>
        <PanelResizeHandle
          aria-label="Resize first and last panels"
          className="resize-handle-salt-border-left resize-handle-salt-border-right"
        />
        <Panel defaultSize={50} minSize={0}>
          Last
        </Panel>
      </PanelGroup>
    </div>
  );
}

it("changes a react-resizable-panels v3 separator's background when hovered and dragged", async () => {
  await renderWithSalt(<LegacyPanels />);

  const separator = page
    .getByRole("separator", { name: "Resize first and last panels" })
    .element() as HTMLElement;
  const { left, top, width, height } = separator.getBoundingClientRect();
  const point = { x: left + width / 2, y: top + height / 2 };
  const defaultBackground = getComputedStyle(separator).backgroundColor;

  await mouse.move(point);
  await expect
    .element(separator)
    .toHaveAttribute("data-resize-handle-state", "hover");
  await expect
    .poll(() => getComputedStyle(separator).backgroundColor)
    .not.toBe(defaultBackground);
  const hoverBackground = getComputedStyle(separator).backgroundColor;

  await mouse.down(point);
  await mouse.move({ x: point.x + 20, y: point.y });

  try {
    await expect
      .element(separator)
      .toHaveAttribute("data-resize-handle-state", "drag");
    await expect
      .poll(() => getComputedStyle(separator).backgroundColor)
      .not.toBe(hoverBackground);
    expect(getComputedStyle(separator).backgroundColor).not.toBe(
      defaultBackground,
    );
  } finally {
    await mouse.up({ x: point.x + 20, y: point.y });
  }
});
