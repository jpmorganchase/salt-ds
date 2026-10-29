import type { DrawerProps } from "@salt-ds/core";
import { Drawer } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { type CSSProperties, useLayoutEffect } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { mouse, touch } from "~browser-test-utils/pointer";
import { act, renderWithSalt } from "~browser-test-utils/render";
import * as drawerStories from "~stories/drawer/drawer.stories";

const { Resizable } = composeStories(drawerStories);

type Position = NonNullable<DrawerProps["position"]>;

const POSITIONS: Position[] = ["left", "right", "top", "bottom"];

const isHorizontal = (position: Position) =>
  position === "left" || position === "right";

const limitsStyle = (position: Position) =>
  isHorizontal(position)
    ? { width: 300, minWidth: 100, maxWidth: 600 }
    : { height: 300, minHeight: 100, maxHeight: 600 };

// Clears the story's own CSS-variable limits so each test sets the limits it needs.
const ResizableDrawer = (props: DrawerProps) => (
  <Resizable
    open
    {...props}
    style={
      {
        "--saltDrawer-minResize": undefined,
        "--saltDrawer-maxResize": undefined,
        animation: "none",
        ...props.style,
      } as CSSProperties
    }
  />
);

// Unsectioned content, so the resizable inner wrapper scrolls instead of DrawerContent.
const OverflowingDrawer = ({ position }: { position: Position }) => (
  <Drawer
    open
    resizable
    position={position}
    style={{ ...limitsStyle(position), animation: "none" }}
  >
    <div style={{ width: 2000, height: 2000, flexShrink: 0 }}>Content</div>
  </Drawer>
);

afterEach(() => page.viewport(1280, 1024));

const GROW_KEY = {
  left: "ArrowRight",
  right: "ArrowLeft",
  top: "ArrowDown",
  bottom: "ArrowUp",
} as const;

const SHRINK_KEY = {
  left: "ArrowLeft",
  right: "ArrowRight",
  top: "ArrowUp",
  bottom: "ArrowDown",
} as const;

const ORIENTATION = {
  left: "vertical",
  right: "vertical",
  top: "horizontal",
  bottom: "horizontal",
} as const;

const growDelta = (position: Position, distance: number) =>
  position === "left" || position === "top" ? distance : -distance;

const drawer = () => page.getByRole("dialog").element() as HTMLElement;

const separator = () => page.getByRole("separator", { name: "Resize drawer" });

const handle = () => separator().element() as HTMLElement;

const drawerSize = (position: Position) => {
  const rect = drawer().getBoundingClientRect();
  return isHorizontal(position) ? rect.width : rect.height;
};

const sizeBase = () =>
  Number.parseFloat(
    getComputedStyle(drawer()).getPropertyValue("--salt-size-base"),
  );

const valueNow = () =>
  Number(separator().element().getAttribute("aria-valuenow"));

async function waitForOpen() {
  await expect.element(page.getByRole("dialog")).toBeVisible();
}

function handleCenter() {
  const rect = handle().getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

const moveAlong = (
  position: Position,
  { x, y }: { x: number; y: number },
  delta: number,
) => (isHorizontal(position) ? { x: x + delta, y } : { x, y: y + delta });

async function dragHandleBy(position: Position, delta: number) {
  const start = handleCenter();
  await mouse.drag(start, moveAlong(position, start, delta));
}

async function pressOnHandle(key: string) {
  handle().focus();
  await expect.element(separator()).toHaveFocus();
  await userEvent.keyboard(key);
}

async function tabToSeparator() {
  await expect
    .element(page.getByRole("button", { name: "Close drawer" }))
    .toHaveFocus();
  await userEvent.tab({ shift: true });
  await expect.element(separator()).toHaveFocus();
}

/** Point, level with the handle, where the moving edge sits when the drawer has the given size. */
function pointForSize(position: Position, size: number) {
  const rect = drawer().getBoundingClientRect();
  const { x, y } = handleCenter();
  switch (position) {
    case "left":
      return { x: rect.left + size, y };
    case "right":
      return { x: rect.right - size, y };
    case "top":
      return { x, y: rect.top + size };
    default:
      return { x, y: rect.bottom - size };
  }
}

async function clickHandle() {
  await mouse.click(handleCenter());
}

const guide = () =>
  document.querySelector<HTMLElement>(".saltDrawerResizeGuide");

const guideOffset = () =>
  Number.parseFloat(
    guide()?.style.getPropertyValue("--drawerResizeGuide-offset") ?? "",
  );

async function renderResizable({
  position = "left",
  ...props
}: Partial<DrawerProps> = {}) {
  await renderWithSalt(
    <ResizableDrawer
      position={position}
      style={limitsStyle(position)}
      {...props}
    />,
  );
  await waitForOpen();
}

async function openDrawer() {
  await page.getByRole("button", { name: "Open Drawer" }).click();
  await waitForOpen();
}

async function renderResizableStory({
  position = "left",
  ...props
}: Partial<DrawerProps> = {}) {
  const result = await renderWithSalt(
    <Resizable
      position={position}
      style={{ ...limitsStyle(position), animation: "none" }}
      {...props}
    />,
  );
  await openDrawer();
  return result;
}

describe("GIVEN a resizable Drawer", () => {
  describe("size", () => {
    it("returns to its declared size when resizing is turned off", async () => {
      const sizesWhenTurnedOff: number[] = [];
      function ToggleFixture({ resizable }: { resizable: boolean }) {
        useLayoutEffect(() => {
          if (!resizable) sizesWhenTurnedOff.push(drawerSize("left"));
        }, [resizable]);
        return (
          <ResizableDrawer resizable={resizable} style={limitsStyle("left")} />
        );
      }
      const { rerender } = await renderWithSalt(<ToggleFixture resizable />);
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await rerender(<ToggleFixture resizable={false} />);

      expect(sizesWhenTurnedOff).toHaveLength(1);
      expect(sizesWhenTurnedOff[0]).toBeCloseTo(300, 0);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
      await expect.element(separator()).not.toBeInTheDocument();
    });

    it("leaves content controls clickable", async () => {
      await renderWithSalt(<ResizableDrawer style={{ width: 300 }} />);
      await waitForOpen();

      await page.getByRole("button", { name: "Save" }).click();
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("pointer resizing", () => {
    for (const position of POSITIONS) {
      it(`grows when dragged away from its edge, position=${position}`, async () => {
        await renderResizable({ position });

        await dragHandleBy(position, growDelta(position, 60));

        await expect.poll(() => drawerSize(position)).toBeCloseTo(360, 0);
      });

      it(`shrinks when dragged towards its edge, position=${position}`, async () => {
        await renderResizable({ position });

        await dragHandleBy(position, growDelta(position, -60));

        await expect.poll(() => drawerSize(position)).toBeCloseTo(240, 0);
      });
    }

    it("stops at its maximum and minimum size", async () => {
      await renderResizable();

      await dragHandleBy("left", 900);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);

      await dragHandleBy("left", -900);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);
    });

    it("stops resizing when the drag is cancelled", async () => {
      await renderResizable();

      const start = handleCenter();
      await touch.start(start);
      await touch.move({ x: start.x + 50, y: start.y });
      expect(getComputedStyle(document.body).cursor).toBe("ew-resize");

      await touch.cancel();

      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
      expect(drawerSize("left")).toBeCloseTo(350, 0);
    });

    it("ignores a non-primary pointer", async () => {
      await renderResizable();

      const start = handleCenter();
      const firstTouch = { x: start.x - 200, y: start.y };
      await touch.start(firstTouch, start);
      await touch.move(firstTouch, { x: start.x + 80, y: start.y });
      await touch.end();

      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("resizes when dragged from just outside its edge", async () => {
      await renderResizable();

      const rect = drawer().getBoundingClientRect();
      const x = rect.right + 5;
      const y = rect.top + 120;
      await mouse.drag({ x, y }, { x: x + 50, y });

      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
      await expect.poll(() => drawerSize("left")).toBeCloseTo(350, 0);
    });

    it("resizes from just outside its edge when the page fills the viewport", async () => {
      await renderWithSalt(
        <div style={{ width: "100vw", minHeight: "100vh" }}>
          <ResizableDrawer style={limitsStyle("left")} />
        </div>,
      );
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const x = rect.right + 5;
      const y = rect.top + 120;
      await mouse.drag({ x, y }, { x: x + 50, y });

      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
      await expect.poll(() => drawerSize("left")).toBeCloseTo(350, 0);
    });

    it("doesn't resize through a layer above the drawer", async () => {
      await renderWithSalt(
        <>
          <ResizableDrawer style={limitsStyle("left")} disableDismiss />
          <div
            role="status"
            style={{
              position: "fixed",
              left: 300,
              top: 0,
              width: 50,
              height: "100vh",
              zIndex: "calc(var(--salt-zIndex-drawer) + 1)",
            }}
          />
        </>,
      );
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const x = rect.right + 5;
      const y = rect.top + 120;
      await mouse.drag({ x, y }, { x: x + 50, y });

      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("dismisses rather than resizes on a press further outside the drawer", async () => {
      await renderResizable();

      const rect = drawer().getBoundingClientRect();
      await mouse.click({ x: rect.right + 40, y: rect.top + 120 });

      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    });

    it("cancels with Escape without closing the drawer", async () => {
      await renderResizable();

      const start = handleCenter();
      await mouse.down(start);
      await mouse.move({ x: start.x + 50, y: start.y });
      await expect.poll(() => drawerSize("left")).toBeCloseTo(350, 0);

      await userEvent.keyboard("{Escape}");

      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
      await expect.element(separator()).toHaveAttribute("aria-valuenow", "300");
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");

      await mouse.move({ x: start.x + 80, y: start.y });
      await mouse.up();
      expect(drawerSize("left")).toBeCloseTo(300, 0);
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    });

    it("restores the cursor when the drawer closes mid-drag", async () => {
      const { rerender } = await renderWithSalt(
        <ResizableDrawer style={limitsStyle("left")} />,
      );
      await waitForOpen();

      const start = handleCenter();
      await mouse.down(start);
      await mouse.move({ x: start.x + 40, y: start.y });
      expect(getComputedStyle(document.body).cursor).toBe("ew-resize");

      await rerender(
        <ResizableDrawer open={false} style={limitsStyle("left")} />,
      );
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();

      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
    });
  });

  describe("keyboard resizing", () => {
    for (const position of POSITIONS) {
      it(`grows and shrinks with the arrow keys, position=${position}`, async () => {
        await renderResizable({ position });

        await pressOnHandle(`{${GROW_KEY[position]}}`);
        await expect.poll(() => drawerSize(position)).toBeGreaterThan(300);

        await pressOnHandle(`{${SHRINK_KEY[position]}}`);
        await expect.poll(() => drawerSize(position)).toBeCloseTo(300, 0);
      });
    }

    it("ignores the arrow keys of the other axis", async () => {
      await renderResizable();

      await pressOnHandle("{ArrowUp}");
      await pressOnHandle("{ArrowDown}");

      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("jumps to its limits with Home and End", async () => {
      await renderResizable();

      await pressOnHandle("{Home}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await pressOnHandle("{End}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
    });

    it("collapses and restores with Enter", async () => {
      await renderResizable();

      await pressOnHandle("{Enter}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await pressOnHandle("{Enter}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("restores the size it had before Home with Enter", async () => {
      await renderResizable();

      await dragHandleBy("left", 50);
      await pressOnHandle("{Home}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await pressOnHandle("{Enter}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(350, 0);
    });
  });

  describe("size limits", () => {
    for (const position of POSITIONS) {
      it(`never shrinks below --salt-size-base without limits, position=${position}`, async () => {
        await renderWithSalt(
          <ResizableDrawer
            position={position}
            style={isHorizontal(position) ? { width: 320 } : { height: 280 }}
          />,
        );
        await waitForOpen();

        await dragHandleBy(position, growDelta(position, -2000));

        await expect
          .poll(() => drawerSize(position))
          .toBeCloseTo(sizeBase(), 0);
      });
    }

    it("accepts width limits as CSS variables", async () => {
      await renderWithSalt(
        <ResizableDrawer
          style={
            {
              width: 300,
              "--saltDrawer-minResize": "200px",
              "--saltDrawer-maxResize": "400px",
            } as CSSProperties
          }
        />,
      );
      await waitForOpen();

      await dragHandleBy("left", -2000);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(200, 0);

      await dragHandleBy("left", 2000);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);
    });

    it("accepts height limits as CSS variables", async () => {
      await renderWithSalt(
        <ResizableDrawer
          position="top"
          style={
            {
              height: 300,
              "--saltDrawer-minResize": "10vh",
              "--saltDrawer-maxResize": "50vh",
            } as CSSProperties
          }
        />,
      );
      await waitForOpen();

      await dragHandleBy("top", -2000);
      await expect
        .poll(() => drawerSize("top"))
        .toBeCloseTo(window.innerHeight * 0.1, 0);

      await dragHandleBy("top", 2000);
      await expect
        .poll(() => drawerSize("top"))
        .toBeCloseTo(window.innerHeight * 0.5, 0);
    });

    it("finds its limits when its size is animated", async () => {
      await renderResizable({
        style: { ...limitsStyle("left"), transition: "width 200ms" },
      });

      await expect.element(separator()).toHaveAttribute("aria-valuemin", "100");
      await expect.element(separator()).toHaveAttribute("aria-valuemax", "600");

      await act(async () => handle().focus());
      expect(drawer().getAnimations()).toHaveLength(0);

      await userEvent.keyboard("{End}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
    });

    const handleOuterEdge = (position: Position) => {
      const rect = handle().getBoundingClientRect();
      switch (position) {
        case "left":
          return window.innerWidth - rect.right;
        case "right":
          return rect.left;
        case "top":
          return window.innerHeight - rect.bottom;
        default:
          return rect.top;
      }
    };

    for (const position of POSITIONS) {
      it(`keeps the handle's whole target on screen at its maximum size, position=${position}`, async () => {
        await renderWithSalt(
          <ResizableDrawer
            position={position}
            style={isHorizontal(position) ? { width: 300 } : { height: 300 }}
          />,
        );
        await waitForOpen();

        await pressOnHandle("{End}");

        await expect.poll(() => handleOuterEdge(position)).toBeCloseTo(0, 0);
      });
    }

    it("keeps the handle's whole target on screen when its style fills the viewport", async () => {
      await renderWithSalt(<ResizableDrawer style={{ width: "100vw" }} />);
      await waitForOpen();

      expect(handleOuterEdge("left")).toBeCloseTo(0, 0);
    });
  });

  describe("click to place", () => {
    for (const position of POSITIONS) {
      it(`places the edge where the next click lands, position=${position}`, async () => {
        await renderResizable({ position });

        await clickHandle();
        await mouse.click(pointForSize(position, 450));

        await expect.poll(() => drawerSize(position)).toBeCloseTo(450, 0);
      });
    }

    it("doesn't resize until the next click", async () => {
      await renderResizable();

      await clickHandle();
      await mouse.move(pointForSize("left", 420));
      await mouse.move(pointForSize("left", 900));
      expect(drawerSize("left")).toBeCloseTo(300, 0);

      await mouse.click(pointForSize("left", 450));
      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
    });

    it("places the edge on release, not on press", async () => {
      await renderResizable();

      await clickHandle();
      const point = pointForSize("left", 450);
      await mouse.down(point);
      expect(drawerSize("left")).toBeCloseTo(300, 0);

      await mouse.up(point);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
    });

    it("keeps the placed size within the limits", async () => {
      await renderResizable();

      await clickHandle();
      await mouse.click(pointForSize("left", 900));

      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
    });

    it("treats a slightly shaky click as a click", async () => {
      await renderResizable();

      const start = handleCenter();
      await mouse.down(start);
      await mouse.move({ x: start.x + 2, y: start.y });
      await mouse.up();
      expect(drawerSize("left")).toBeCloseTo(300, 0);

      await mouse.click(pointForSize("left", 450));
      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
    });

    it("drags instead of placing when the press moves further", async () => {
      await renderResizable();

      await dragHandleBy("left", 20);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(320, 0);

      await mouse.click(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(320, 0);
    });

    it("places the edge with a second tap on touch", async () => {
      await renderResizable();

      await touch.tap(handleCenter());
      await touch.tap(pointForSize("left", 450));

      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
    });

    it("cancels with Escape without closing the drawer", async () => {
      await renderResizable();

      await clickHandle();
      await mouse.move(pointForSize("left", 450));
      await userEvent.keyboard("{Escape}");

      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("stops placing on another key, which still works", async () => {
      await renderResizable();

      await clickHandle();
      await pressOnHandle("{ArrowRight}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(308, 0);

      await mouse.click(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(308, 0);
    });

    it("cancels on a secondary button press", async () => {
      await renderResizable();

      await clickHandle();
      const point = pointForSize("left", 450);
      await mouse.down(point, "right");
      await mouse.up(point);

      await mouse.click(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("cancels when the window loses focus", async () => {
      await renderResizable();

      await clickHandle();
      await act(async () => {
        window.dispatchEvent(new FocusEvent("blur"));
      });

      await mouse.click(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("shows the resize cursor while placing", async () => {
      await renderResizable();

      await clickHandle();
      await mouse.move(pointForSize("left", 450));
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("ew-resize");

      await userEvent.keyboard("{Escape}");
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
    });

    it("doesn't close the drawer when the edge is placed on the scrim", async () => {
      await renderResizable();

      await separator().click();
      await page
        .getByTestId("scrim")
        .click({ force: true, position: { x: 450, y: 300 } });

      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    });

    it("doesn't activate content where the edge is placed", async () => {
      const { hash } = window.location;
      await renderResizableStory();
      const save = page.getByRole("button", { name: "Save" });
      const link = page.getByRole("link", { name: "example link" });

      const placingEnded = () =>
        expect.poll(() => getComputedStyle(document.body).cursor).toBe("auto");
      const pointOver = (element: Element) => {
        const { left, top, width, height } = element.getBoundingClientRect();
        return {
          x: Math.round(left + width / 2),
          y: Math.round(top + height / 2),
        };
      };

      await separator().click();
      const savePoint = pointOver(save.element());
      await mouse.click(savePoint);
      await placingEnded();
      await expect
        .poll(() => drawerSize("left"))
        .toBeCloseTo(savePoint.x - drawer().getBoundingClientRect().left, 0);

      await separator().click();
      await mouse.click(pointOver(link.element()));
      await placingEnded();

      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
      expect(window.location.hash).toBe(hash);
      await expect.element(separator()).toHaveFocus();

      await save.click();
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    });

    it("keeps the size when cancelled or placed at the current edge", async () => {
      await renderResizable();

      await clickHandle();
      await userEvent.keyboard("{Escape}");
      await clickHandle();
      await mouse.click(pointForSize("left", 300));

      expect(drawerSize("left")).toBeCloseTo(300, 0);
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    });

    it("keeps the size when the handle is clicked again, as in a double-click", async () => {
      await renderResizable();

      await clickHandle();
      await mouse.click(handleCenter());

      await expect.poll(guide).toBeNull();
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("keeps the size when clicked just outside the edge, within the handle's target", async () => {
      await renderResizable();

      await clickHandle();
      const { y } = handleCenter();
      await mouse.click({ x: drawer().getBoundingClientRect().right + 4, y });

      await expect.poll(guide).toBeNull();
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("snaps the guide line to the edge while over the handle", async () => {
      await renderResizable();

      await clickHandle();
      await mouse.move(pointForSize("left", 450));
      await expect
        .poll(guideOffset)
        .toBeCloseTo(drawer().getBoundingClientRect().left + 450, 0);

      await mouse.move(handleCenter());
      await expect
        .poll(guideOffset)
        .toBeCloseTo(drawer().getBoundingClientRect().right, 0);
    });

    it("places the edge when dismissing is disabled", async () => {
      await renderResizable({ disableDismiss: true });

      await clickHandle();
      await mouse.click(pointForSize("left", 450));

      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    });

    it("cancels when the window is resized", async () => {
      await renderResizable();

      await clickHandle();
      await expect.poll(guide).not.toBeNull();
      await page.viewport(1000, 800);
      await expect.poll(guide).toBeNull();

      await mouse.click(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("stops placing when the drawer closes", async () => {
      const { rerender } = await renderWithSalt(
        <ResizableDrawer style={limitsStyle("left")} />,
      );
      await waitForOpen();

      await clickHandle();
      await expect.poll(guide).not.toBeNull();
      await rerender(
        <ResizableDrawer open={false} style={limitsStyle("left")} />,
      );

      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await expect.poll(guide).toBeNull();
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
    });

    it("stops placing when resizing is turned off", async () => {
      const { rerender } = await renderWithSalt(
        <ResizableDrawer style={limitsStyle("left")} />,
      );
      await waitForOpen();

      await clickHandle();
      await expect.poll(guide).not.toBeNull();
      await rerender(
        <ResizableDrawer resizable={false} style={limitsStyle("left")} />,
      );

      await expect.poll(guide).toBeNull();
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
      await expect.element(separator()).not.toBeInTheDocument();
    });
  });

  describe("user size", () => {
    it("keeps the user's size when closed and reopened", async () => {
      await renderResizableStory();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await page.getByRole("button", { name: "Close drawer" }).click();
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await openDrawer();

      expect(drawerSize("left")).toBeCloseTo(400, 0);
      await expect.element(separator()).toHaveAttribute("aria-valuenow", "400");
    });

    it("keeps the user's size when the style size changes", async () => {
      const limits = { minWidth: 100, maxWidth: 600 };
      const { rerender } = await renderWithSalt(
        <ResizableDrawer style={{ width: 300, ...limits }} />,
      );
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await rerender(<ResizableDrawer style={{ width: 200, ...limits }} />);

      expect(drawerSize("left")).toBeCloseTo(400, 0);
    });

    it("starts again from the style size when remounted with a new key", async () => {
      const { rerender } = await renderWithSalt(
        <ResizableDrawer key="first" style={limitsStyle("left")} />,
      );
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await rerender(
        <ResizableDrawer key="second" style={limitsStyle("left")} />,
      );
      await waitForOpen();

      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
      await expect.element(separator()).toHaveAttribute("aria-valuenow", "300");
    });
  });

  describe("layout changes", () => {
    it("does not carry a width over as a height when the position changes", async () => {
      const style = { width: 300, height: 200 };
      const { rerender } = await renderWithSalt(
        <ResizableDrawer style={style} />,
      );
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await rerender(<ResizableDrawer position="top" style={style} />);

      await expect.poll(() => drawerSize("top")).toBeCloseTo(200, 0);
    });
  });

  describe("overflowing content", () => {
    const inner = () =>
      drawer().querySelector<HTMLElement>(".saltDrawer-inner") as HTMLElement;

    const overlaps = (a: DOMRect, b: DOMRect) =>
      a.left < b.right - 0.5 &&
      b.left < a.right - 0.5 &&
      a.top < b.bottom - 0.5 &&
      b.top < a.bottom - 0.5;

    const straddlesEdge = (position: Position) => {
      const drawerRect = drawer().getBoundingClientRect();
      const handleRect = handle().getBoundingClientRect();
      switch (position) {
        case "left":
          return (
            handleRect.left < drawerRect.right &&
            handleRect.right > drawerRect.right
          );
        case "right":
          return (
            handleRect.left < drawerRect.left &&
            handleRect.right > drawerRect.left
          );
        case "top":
          return (
            handleRect.top < drawerRect.bottom &&
            handleRect.bottom > drawerRect.bottom
          );
        default:
          return (
            handleRect.top < drawerRect.top &&
            handleRect.bottom > drawerRect.top
          );
      }
    };

    const expectDrawerNotToScroll = () => {
      drawer().scrollTop = 100;
      drawer().scrollLeft = 100;
      expect(drawer().scrollTop).toBe(0);
      expect(drawer().scrollLeft).toBe(0);
    };

    for (const position of POSITIONS) {
      it(`scrolls inside, keeping the handle on its edge, position=${position}`, async () => {
        await renderWithSalt(<OverflowingDrawer position={position} />);
        await waitForOpen();

        const scroller = inner();
        expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
        expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
        expectDrawerNotToScroll();

        const { scrollWidth, scrollHeight } = scroller;
        const { left, top } = handle().getBoundingClientRect();
        scroller.scrollLeft = scrollWidth;
        scroller.scrollTop = scrollHeight;
        await expect.poll(() => scroller.scrollTop).toBeGreaterThan(0);

        expect(scroller.scrollWidth).toBe(scrollWidth);
        expect(scroller.scrollHeight).toBe(scrollHeight);
        expect(handle().getBoundingClientRect().left).toBe(left);
        expect(handle().getBoundingClientRect().top).toBe(top);
        expect(straddlesEdge(position)).toBe(true);
      });
    }

    it("scrolls the sections together when they don't fit", async () => {
      await renderWithSalt(
        <ResizableDrawer style={{ width: 300, maxHeight: 120 }} />,
      );
      await waitForOpen();

      const scroller = inner();
      expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
      expectDrawerNotToScroll();
      expect(
        overlaps(
          handle().getBoundingClientRect(),
          scroller.getBoundingClientRect(),
        ),
      ).toBe(false);
    });
  });

  describe("separator semantics", () => {
    for (const position of POSITIONS) {
      it(`exposes a ${ORIENTATION[position]} separator when position=${position}`, async () => {
        await renderResizable({ position });

        await expect
          .element(separator())
          .toHaveAttribute("aria-orientation", ORIENTATION[position]);
      });

      it(`reports its size and limits before any interaction, position=${position}`, async () => {
        await renderResizable({ position });

        await expect
          .element(separator())
          .toHaveAttribute("aria-valuenow", "300");
        await expect
          .element(separator())
          .toHaveAttribute("aria-valuemin", "100");
        await expect
          .element(separator())
          .toHaveAttribute("aria-valuemax", "600");
      });
    }

    it("updates its value after a keyboard resize", async () => {
      await renderResizableStory();

      await tabToSeparator();
      await userEvent.keyboard("{ArrowRight}");

      await expect.poll(valueNow).toBeGreaterThan(300);
      expect(valueNow()).toBeCloseTo(drawer().getBoundingClientRect().width, 0);
    });

    it("updates its value after a pointer resize", async () => {
      await renderResizable();

      const { x, y } = handleCenter();
      await mouse.drag({ x, y }, { x: x + 50, y });

      await expect.element(separator()).toHaveAttribute("aria-valuenow", "350");
    });

    it("updates its value after the edge is placed by a click", async () => {
      await renderResizable();

      const { x, y } = handleCenter();
      await mouse.click({ x, y });
      await mouse.click({ x: 450, y });

      await expect.element(separator()).toHaveAttribute("aria-valuenow", "450");
    });

    it("updates its maximum when the viewport resizes", async () => {
      await renderWithSalt(<ResizableDrawer style={{ width: 300 }} />);
      await waitForOpen();
      const outside =
        separator().element().getBoundingClientRect().right -
        drawer().getBoundingClientRect().right;
      expect(outside).toBeGreaterThan(0);
      await expect
        .element(separator())
        .toHaveAttribute("aria-valuemax", String(window.innerWidth - outside));

      await page.viewport(900, 700);
      await expect
        .element(separator())
        .toHaveAttribute("aria-valuemax", String(900 - outside));
    });

    it("points at the drawer it controls", async () => {
      await renderResizable();

      await expect
        .element(separator())
        .toHaveAttribute("aria-controls", drawer().id);
    });
  });

  describe("focus management", () => {
    it("is reachable by keyboard within the drawer's focus trap", async () => {
      await renderResizableStory();

      await tabToSeparator();

      await userEvent.tab();
      await expect
        .element(page.getByRole("button", { name: "Close drawer" }))
        .toHaveFocus();
    });

    it("shows a focus indicator when focused with the keyboard", async () => {
      await renderResizableStory();

      await tabToSeparator();

      const element = separator().element();
      const hasOutline = [
        getComputedStyle(element),
        getComputedStyle(element, "::before"),
      ].some(
        (style) =>
          style.outlineStyle !== "none" &&
          Number.parseFloat(style.outlineWidth) > 0,
      );
      expect(hasOutline).toBe(true);
    });

    it("keeps focus on the handle after the edge is placed by a click", async () => {
      await renderResizable();

      await separator().click();
      await page
        .getByTestId("scrim")
        .click({ force: true, position: { x: 450, y: 300 } });
      await expect.element(separator()).toHaveAttribute("aria-valuenow", "450");

      await expect.element(separator()).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(separator()).toHaveAttribute("aria-valuenow", "458");
    });

    it("returns focus to the trigger after a resized drawer closes", async () => {
      await renderResizableStory();

      await tabToSeparator();
      await userEvent.keyboard("{ArrowRight}");
      await expect.poll(valueNow).toBeGreaterThan(300);

      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "Open Drawer" }))
        .toHaveFocus();
    });
  });

  describe("axe", () => {
    const AXE_TIMEOUT = 30_000;

    for (const position of POSITIONS) {
      it(
        `has no violations when position=${position}`,
        async () => {
          const { container } = await renderResizableStory({ position });

          await runAxeScan(container);
        },
        AXE_TIMEOUT,
      );
    }

    it(
      "has no violations while resizing",
      async () => {
        const { container } = await renderResizableStory();

        const { x, y } = handleCenter();
        await mouse.down({ x, y });
        await mouse.move({ x: x + 30, y });
        await expect
          .element(separator())
          .toHaveAttribute("aria-valuenow", "330");

        await runAxeScan(container);

        await mouse.up();
      },
      AXE_TIMEOUT,
    );

    it(
      "has no violations while placing the edge by click",
      async () => {
        const { container } = await renderResizableStory();

        const { x, y } = handleCenter();
        await mouse.click({ x, y });
        await mouse.move({ x: 450, y });
        await expect
          .poll(() => getComputedStyle(document.body).cursor)
          .toBe("ew-resize");

        await runAxeScan(container);
      },
      AXE_TIMEOUT,
    );
  });
});
