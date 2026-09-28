import type { DrawerProps } from "@salt-ds/core";
import { Button, Drawer, DrawerContent, DrawerHeader } from "@salt-ds/core";
import { type CSSProperties, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { act, renderWithSalt } from "~browser-test-utils/render";

type Position = NonNullable<DrawerProps["position"]>;

const POSITIONS: Position[] = ["left", "right", "top", "bottom"];

/** The arrow key that makes a drawer bigger at each position. */
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

const isHorizontal = (position: Position) =>
  position === "left" || position === "right";

/** Dragging towards higher coordinates grows a left or top drawer. */
const growDelta = (position: Position, distance: number) =>
  position === "left" || position === "top" ? distance : -distance;

const drawer = () => page.getByRole("dialog").element() as HTMLElement;

const handle = () =>
  page
    .getByRole("separator", { name: "Resize drawer" })
    .element() as HTMLElement;

const drawerSize = (position: Position) => {
  const rect = drawer().getBoundingClientRect();
  return isHorizontal(position) ? rect.width : rect.height;
};

const sizeBase = () =>
  Number.parseFloat(
    getComputedStyle(drawer()).getPropertyValue("--salt-size-base"),
  );

/**
 * A Drawer mounts off-screen and slides in, so geometry is only meaningful
 * once the animation has settled.
 */
async function waitForOpen() {
  await expect.element(page.getByRole("dialog")).toBeVisible();
  await expect
    .poll(() => {
      const { top, left } = drawer().getBoundingClientRect();
      return Math.min(top, left);
    })
    .toBeGreaterThanOrEqual(0);
}

async function dispatchPointer(
  target: EventTarget,
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel",
  clientX: number,
  clientY: number,
  init: PointerEventInit = {},
) {
  await act(async () => {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        button: 0,
        buttons: type === "pointerup" ? 0 : 1,
        clientX,
        clientY,
        isPrimary: true,
        pointerId: 1,
        pointerType: "mouse",
        ...init,
      }),
    );
  });
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

/** Drags the handle by `delta` along the drawer's resize axis. */
async function dragHandleBy(position: Position, delta: number) {
  const start = handleCenter();
  const end = moveAlong(position, start, delta);

  await dispatchPointer(handle(), "pointerdown", start.x, start.y);
  await dispatchPointer(handle(), "pointermove", end.x, end.y);
  await dispatchPointer(handle(), "pointerup", end.x, end.y);
}

async function pressOnHandle(key: string) {
  handle().focus();
  await expect.poll(() => document.activeElement).toBe(handle());
  await userEvent.keyboard(key);
}

const limitsStyle = (position: Position) =>
  isHorizontal(position)
    ? { width: 300, minWidth: 100, maxWidth: 600 }
    : { height: 300, minHeight: 100, maxHeight: 600 };

function ResizableFixture({
  position = "left",
  ...rest
}: Partial<DrawerProps>) {
  return (
    <Drawer
      open
      resizable
      position={position}
      style={limitsStyle(position)}
      {...rest}
    >
      <DrawerHeader header="Resizable drawer" />
      <DrawerContent>Content</DrawerContent>
    </Drawer>
  );
}

function DismissibleFixture() {
  const [open, setOpen] = useState(true);
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      resizable
      style={limitsStyle("left")}
    >
      <DrawerHeader header="Resizable drawer" />
      <DrawerContent>Content</DrawerContent>
    </Drawer>
  );
}

describe("GIVEN a resizable Drawer", () => {
  describe("size", () => {
    it("returns to its declared size when resizing is turned off", async () => {
      function ToggleFixture() {
        const [resizable, setResizable] = useState(true);
        return (
          <Drawer open resizable={resizable} style={limitsStyle("left")}>
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>
              <Button onClick={() => setResizable(false)}>
                Turn off resizing
              </Button>
            </DrawerContent>
          </Drawer>
        );
      }
      await renderWithSalt(<ToggleFixture />);
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await page.getByRole("button", { name: "Turn off resizing" }).click();

      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
      await expect
        .element(page.getByRole("separator", { name: "Resize drawer" }))
        .not.toBeInTheDocument();
    });

    it("leaves content controls clickable", async () => {
      const onClick = vi.fn();
      await renderWithSalt(
        <Drawer open resizable style={{ width: 300 }}>
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>
            <Button onClick={onClick}>Action</Button>
          </DrawerContent>
        </Drawer>,
      );
      await waitForOpen();

      await page.getByRole("button", { name: "Action" }).click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("pointer resizing", () => {
    for (const position of POSITIONS) {
      it(`grows when dragged away from its edge, position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

        await dragHandleBy(position, growDelta(position, 60));

        await expect.poll(() => drawerSize(position)).toBeCloseTo(360, 0);
      });

      it(`shrinks when dragged towards its edge, position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

        await dragHandleBy(position, growDelta(position, -60));

        await expect.poll(() => drawerSize(position)).toBeCloseTo(240, 0);
      });
    }

    it("stops at its maximum and minimum size", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await dragHandleBy("left", 900);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);

      await dragHandleBy("left", -900);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);
    });

    it("stops resizing when the drag is cancelled", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      const start = handleCenter();
      await dispatchPointer(handle(), "pointerdown", start.x, start.y);
      await dispatchPointer(handle(), "pointermove", start.x + 50, start.y);
      await dispatchPointer(handle(), "pointercancel", start.x + 50, start.y);
      await dispatchPointer(window, "pointermove", start.x + 150, start.y);

      await expect.poll(() => drawerSize("left")).toBeCloseTo(350, 0);
    });

    it("ignores a non-primary pointer", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      const start = handleCenter();
      const secondTouch = {
        isPrimary: false,
        pointerId: 2,
        pointerType: "touch",
      };
      await dispatchPointer(
        handle(),
        "pointerdown",
        start.x,
        start.y,
        secondTouch,
      );
      await dispatchPointer(
        handle(),
        "pointermove",
        start.x + 80,
        start.y,
        secondTouch,
      );
      await dispatchPointer(
        handle(),
        "pointerup",
        start.x + 80,
        start.y,
        secondTouch,
      );

      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("dismisses rather than resizes on a press just outside the drawer", async () => {
      await renderWithSalt(<DismissibleFixture />);
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const x = rect.right + 3;
      const y = rect.top + 120;
      await dispatchPointer(
        document.elementFromPoint(x, y) as Element,
        "pointerdown",
        x,
        y,
      );

      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    });

    it("restores the cursor when the drawer closes mid-drag", async () => {
      await renderWithSalt(<DismissibleFixture />);
      await waitForOpen();

      const start = handleCenter();
      await dispatchPointer(handle(), "pointerdown", start.x, start.y);
      await dispatchPointer(handle(), "pointermove", start.x + 40, start.y);
      expect(getComputedStyle(document.body).cursor).toBe("ew-resize");

      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();

      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
    });
  });

  describe("keyboard resizing", () => {
    for (const position of POSITIONS) {
      it(`grows and shrinks with the arrow keys, position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

        await pressOnHandle(`{${GROW_KEY[position]}}`);
        await expect.poll(() => drawerSize(position)).toBeGreaterThan(300);

        await pressOnHandle(`{${SHRINK_KEY[position]}}`);
        await expect.poll(() => drawerSize(position)).toBeCloseTo(300, 0);
      });
    }

    it("moves further with Shift and an arrow key", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await pressOnHandle("{ArrowRight}");
      await expect.poll(() => drawerSize("left")).toBeGreaterThan(300);
      const step = drawerSize("left") - 300;

      await pressOnHandle("{Shift>}{ArrowRight}{/Shift}");
      await expect
        .poll(() => drawerSize("left"))
        .toBeGreaterThan(300 + step * 2);
    });

    it("ignores the arrow keys of the other axis", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await pressOnHandle("{ArrowUp}");
      await pressOnHandle("{ArrowDown}");

      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("jumps to its limits with Home and End", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await pressOnHandle("{Home}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await pressOnHandle("{End}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
    });

    it("collapses and restores with Enter", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await pressOnHandle("{Enter}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await pressOnHandle("{Enter}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("restores the size it had before Home with Enter", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

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
          <Drawer
            open
            resizable
            position={position}
            style={isHorizontal(position) ? { width: 320 } : { height: 280 }}
          >
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>Content</DrawerContent>
          </Drawer>,
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
        <Drawer
          open
          resizable
          style={
            {
              width: 300,
              "--saltDrawer-minWidth": "200px",
              "--saltDrawer-maxWidth": "400px",
            } as CSSProperties
          }
        >
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
      await waitForOpen();

      await dragHandleBy("left", -2000);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(200, 0);

      await dragHandleBy("left", 2000);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);
    });

    it("accepts height limits as CSS variables", async () => {
      await renderWithSalt(
        <Drawer
          open
          resizable
          position="top"
          style={
            {
              height: 300,
              "--saltDrawer-minHeight": "10vh",
              "--saltDrawer-maxHeight": "50vh",
            } as CSSProperties
          }
        >
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
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
  });

  describe("onResizeFinish", () => {
    it("reports the new size once when a drag ends", async () => {
      const onResizeFinish = vi.fn();
      await renderWithSalt(
        <ResizableFixture onResizeFinish={onResizeFinish} />,
      );
      await waitForOpen();

      await dragHandleBy("left", 50);

      expect(onResizeFinish).toHaveBeenCalledTimes(1);
      expect(onResizeFinish.mock.calls[0][1]).toBeCloseTo(350, 0);
    });

    it("reports the new size after a keyboard resize", async () => {
      const onResizeFinish = vi.fn();
      await renderWithSalt(
        <ResizableFixture onResizeFinish={onResizeFinish} />,
      );
      await waitForOpen();

      await pressOnHandle("{ArrowRight}");
      await expect.poll(() => drawerSize("left")).toBeGreaterThan(300);

      expect(onResizeFinish).toHaveBeenCalledTimes(1);
      expect(onResizeFinish.mock.calls[0][1]).toBeCloseTo(
        drawerSize("left"),
        0,
      );
    });

    it("is not called when the size does not change", async () => {
      const onResizeFinish = vi.fn();
      await renderWithSalt(
        <ResizableFixture onResizeFinish={onResizeFinish} />,
      );
      await waitForOpen();

      await pressOnHandle("{End}");
      onResizeFinish.mockClear();
      await pressOnHandle("{End}");
      await dragHandleBy("left", 0);

      expect(onResizeFinish).not.toHaveBeenCalled();
    });
  });

  describe("layout changes", () => {
    it("does not carry a width over as a height when the position changes", async () => {
      function PositionFixture() {
        const [position, setPosition] = useState<Position>("left");
        return (
          <Drawer
            open
            resizable
            position={position}
            style={{ width: 300, height: 200 }}
          >
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>
              <Button onClick={() => setPosition("top")}>Move to top</Button>
            </DrawerContent>
          </Drawer>
        );
      }
      await renderWithSalt(<PositionFixture />);
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await page.getByRole("button", { name: "Move to top" }).click();

      await expect.poll(() => drawerSize("top")).toBeCloseTo(200, 0);
    });
  });
});
