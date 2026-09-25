import type { DrawerProps } from "@salt-ds/core";
import { Button, Drawer, DrawerContent, DrawerHeader } from "@salt-ds/core";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { act, renderWithSalt } from "~browser-test-utils/render";

type Position = NonNullable<DrawerProps["position"]>;

const POSITIONS: Position[] = ["left", "right", "top", "bottom"];

/** The side of the Drawer that the handle strip is reserved on. */
const RESERVED_SIDE = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
} as const;

const SIDES = ["top", "right", "bottom", "left"] as const;

const HANDLE_SIZE = 6;
const KEYBOARD_STEP = 8;
const KEYBOARD_LARGE_STEP = 40;

const isHorizontal = (position: Position) =>
  position === "left" || position === "right";

function drawer() {
  const element = document.querySelector<HTMLElement>(".saltDrawer");
  if (!element) throw new Error("Drawer missing");
  return element;
}

function handle() {
  const element = document.querySelector<HTMLElement>(
    ".saltDrawerResizeHandle",
  );
  if (!element) throw new Error("Drawer resize handle missing");
  return element;
}

const drawerSize = (position: Position) => {
  const rect = drawer().getBoundingClientRect();
  return isHorizontal(position) ? rect.width : rect.height;
};

const paddingOf = (side: (typeof SIDES)[number]) =>
  Number.parseFloat(
    getComputedStyle(drawer()).getPropertyValue(`padding-${side}`),
  );

/**
 * A Drawer mounts translated off-screen and slides in, so geometry reads and
 * `elementFromPoint` probes are meaningless until the animation has settled.
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
  type: "pointerdown" | "pointermove" | "pointerup",
  clientX: number,
  clientY: number,
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
      }),
    );
  });
}

/** Drags the handle by `delta` along the Drawer's resize axis. */
async function dragHandleBy(position: Position, delta: number) {
  const horizontal = isHorizontal(position);
  const rect = handle().getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  await dispatchPointer(handle(), "pointerdown", startX, startY);
  await dispatchPointer(
    handle(),
    "pointermove",
    horizontal ? startX + delta : startX,
    horizontal ? startY : startY + delta,
  );
  await dispatchPointer(
    handle(),
    "pointerup",
    horizontal ? startX + delta : startX,
    horizontal ? startY : startY + delta,
  );
}

async function pressOnHandle(key: string) {
  handle().focus();
  await expect.poll(() => document.activeElement).toBe(handle());
  await userEvent.keyboard(key);
}

const sizeProps = {
  defaultSize: 300,
  minSize: 100,
  maxSize: 600,
};

function ResizableFixture({
  position = "left",
  ...rest
}: Partial<DrawerProps>) {
  return (
    <Drawer open resizable position={position} {...sizeProps} {...rest}>
      <DrawerHeader header="Resizable drawer" />
      <DrawerContent>Content</DrawerContent>
    </Drawer>
  );
}

function DismissibleFixture({ position = "left" }: { position?: Position }) {
  const [open, setOpen] = useState(true);
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      resizable
      position={position}
      {...sizeProps}
    >
      <DrawerHeader header="Resizable drawer" />
      <DrawerContent>Content</DrawerContent>
    </Drawer>
  );
}

describe("GIVEN a resizable Drawer", () => {
  describe("reserved space", () => {
    for (const position of POSITIONS) {
      it(`keeps its declared size and reserves the handle strip when position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

        const rect = drawer().getBoundingClientRect();

        expect(isHorizontal(position) ? rect.width : rect.height).toBeCloseTo(
          300,
          1,
        );
        expect(rect.width).toBeGreaterThan(0);

        // The reserve is on the handle's side only. A sectioned Drawer has no
        // padding of its own, so it is exactly the handle size.
        for (const side of SIDES) {
          expect(paddingOf(side)).toBeCloseTo(
            side === RESERVED_SIDE[position] ? HANDLE_SIZE : 0,
            1,
          );
        }
      });
    }

    it("shrinks the content box by the handle size", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const content = document.querySelector(
        ".saltDrawerContent",
      ) as HTMLElement;
      expect(content.getBoundingClientRect().width).toBeCloseTo(
        drawer().getBoundingClientRect().width - HANDLE_SIZE,
        1,
      );
    });

    it("reserves nothing and renders no handle when not resizable", async () => {
      await renderWithSalt(
        <Drawer open position="left" style={{ width: 300 }}>
          <DrawerHeader header="Plain drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
      await waitForOpen();

      expect(document.querySelector(".saltDrawerResizeHandle")).toBeNull();
      for (const side of SIDES) {
        expect(paddingOf(side)).toBeCloseTo(0, 1);
      }
      expect(drawer().getBoundingClientRect().width).toBeCloseTo(300, 1);
    });

    it("preserves the legacy padding of an unsectioned Drawer", async () => {
      await renderWithSalt(
        <Drawer open resizable position="left" style={{ width: 300 }}>
          <span>Unsectioned content</span>
        </Drawer>,
      );
      await waitForOpen();

      const basePadding = paddingOf("left");
      expect(basePadding).toBeGreaterThan(0);
      expect(paddingOf("top")).toBeCloseTo(basePadding, 1);
      expect(paddingOf("bottom")).toBeCloseTo(basePadding, 1);
      // The handle's size is added to the Drawer's own padding, not taken from it.
      expect(paddingOf("right")).toBeCloseTo(basePadding + HANDLE_SIZE, 1);
      expect(drawer().getBoundingClientRect().width).toBeCloseTo(300, 1);
    });

    it("does not scroll its own handle out of view", async () => {
      await renderWithSalt(
        <Drawer open resizable position="left" defaultSize={300}>
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
      await waitForOpen();

      // A resizable Drawer never scrolls itself, so the handle cannot be
      // carried out of view by overflowing content.
      expect(getComputedStyle(drawer()).overflow).toBe("clip");
    });

    it("returns to its CSS size when resizing is turned off", async () => {
      function ToggleFixture({ resizable }: { resizable: boolean }) {
        return (
          <Drawer
            open
            resizable={resizable}
            position="left"
            defaultSize={300}
            style={{ width: 420 }}
          >
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>Content</DrawerContent>
          </Drawer>
        );
      }

      const { rerender } = await renderWithSalt(
        <ToggleFixture resizable={true} />,
      );
      await waitForOpen();
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);

      await act(async () => {
        rerender(<ToggleFixture resizable={false} />);
      });

      await expect.poll(() => drawerSize("left")).toBeCloseTo(420, 0);
      expect(document.querySelector(".saltDrawerResizeHandle")).toBeNull();
    });
  });

  describe("pointer resizing", () => {
    for (const position of POSITIONS) {
      // Dragging towards higher coordinates grows a left or top Drawer, and
      // shrinks a right or bottom one.
      const growsWithCoordinate = position === "left" || position === "top";

      it(`grows in the correct direction when position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

        const before = drawerSize(position);
        await dragHandleBy(position, growsWithCoordinate ? 60 : -60);

        await expect
          .poll(() => drawerSize(position))
          .toBeGreaterThan(before + 40);
      });
    }

    it("shrinks when dragged the other way", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const before = drawerSize("left");
      await dragHandleBy("left", -60);

      await expect.poll(() => drawerSize("left")).toBeLessThan(before - 40);
    });

    it("resolves a point inside the widened target to the handle", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const y = rect.top + 120;

      // Past the 6px visible strip, but inside the 16px pointer target.
      expect(document.elementFromPoint(rect.right - 12, y)).toBe(handle());
    });

    it("starts a drag from the widened target, not just the visible strip", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const startX = rect.right - 13;
      const startY = rect.top + 120;

      await dispatchPointer(handle(), "pointerdown", startX, startY);
      await dispatchPointer(handle(), "pointermove", startX + 60, startY);
      await dispatchPointer(handle(), "pointerup", startX + 60, startY);

      await expect
        .poll(() => drawerSize("left"))
        .toBeGreaterThan(rect.width + 40);
    });

    it("dismisses on a press outside the Drawer", async () => {
      await renderWithSalt(<DismissibleFixture position="left" />);
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const y = rect.top + 120;
      const farX = rect.right + 200;
      const target = document.elementFromPoint(farX, y);

      await dispatchPointer(target as Element, "pointerdown", farX, y);

      await expect.poll(() => document.querySelector(".saltDrawer")).toBeNull();
    });

    it("clamps to maxSize", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await dragHandleBy("left", 900);

      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
    });

    it("clamps to minSize", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await dragHandleBy("left", -900);

      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);
    });

    it("never shrinks below the handle's hit area without a minSize", async () => {
      await renderWithSalt(
        <Drawer open resizable position="left" defaultSize={300}>
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
      await waitForOpen();

      await dragHandleBy("left", -900);

      // The handle stays grabbable, so the drawer can always be restored.
      await expect.poll(() => drawerSize("left")).toBeGreaterThanOrEqual(16);
    });
  });

  describe("keyboard resizing", () => {
    it("moves by a step with the arrow keys", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await pressOnHandle("{ArrowRight}");
      await expect
        .poll(() => drawerSize("left"))
        .toBeCloseTo(300 + KEYBOARD_STEP, 0);

      await pressOnHandle("{ArrowLeft}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("moves by a large step with Shift and an arrow key", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await pressOnHandle("{Shift>}{ArrowRight}{/Shift}");
      await expect
        .poll(() => drawerSize("left"))
        .toBeCloseTo(300 + KEYBOARD_LARGE_STEP, 0);
    });

    it("uses the vertical arrow keys for a top Drawer", async () => {
      await renderWithSalt(<ResizableFixture position="top" />);
      await waitForOpen();

      await pressOnHandle("{ArrowDown}");
      await expect
        .poll(() => drawerSize("top"))
        .toBeCloseTo(300 + KEYBOARD_STEP, 0);
    });

    it("inverts the direction for a right Drawer", async () => {
      await renderWithSalt(<ResizableFixture position="right" />);
      await waitForOpen();

      // Towards lower coordinates makes a right Drawer bigger.
      await pressOnHandle("{ArrowLeft}");
      await expect
        .poll(() => drawerSize("right"))
        .toBeCloseTo(300 + KEYBOARD_STEP, 0);
    });

    it("inverts the direction for a bottom Drawer", async () => {
      await renderWithSalt(<ResizableFixture position="bottom" />);
      await waitForOpen();

      await pressOnHandle("{ArrowUp}");
      await expect
        .poll(() => drawerSize("bottom"))
        .toBeCloseTo(300 + KEYBOARD_STEP, 0);
    });

    it("jumps to the limits with Home and End", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await pressOnHandle("{Home}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await pressOnHandle("{End}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
    });

    it("ignores keys that do not resize", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await pressOnHandle("{ArrowUp}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);

      // Enter no longer collapses: collapsing is not offered without an
      // explicit opt-in, so a stray Enter cannot shrink the drawer.
      await pressOnHandle("{Enter}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
    });
  });

  describe("changing position", () => {
    it("drops a size captured on the other axis", async () => {
      function AxisFixture({ position }: { position: Position }) {
        return (
          <Drawer
            open
            resizable
            position={position}
            minSize={100}
            maxSize={600}
          >
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>Content</DrawerContent>
          </Drawer>
        );
      }

      const { rerender } = await renderWithSalt(
        <AxisFixture position="left" />,
      );
      await waitForOpen();

      await dragHandleBy("left", 120);
      const resizedWidth = drawerSize("left");
      expect(resizedWidth).toBeGreaterThan(120);

      await act(async () => {
        rerender(<AxisFixture position="top" />);
      });

      // The width must not be reapplied as a height.
      await expect
        .poll(() => drawer().style.height)
        .not.toBe(`${resizedWidth}px`);

      // The separator must describe the drawer it is now attached to, not the
      // size it had on the previous axis.
      await expect
        .poll(() => {
          const value = handle().getAttribute("aria-valuenow");
          return value === null ? null : Number(value);
        })
        .toBeCloseTo(drawerSize("top"), 0);
    });
  });

  describe("size constraints", () => {
    it("brings a defaultSize beyond maxSize back within range", async () => {
      await renderWithSalt(
        <Drawer
          open
          resizable
          position="left"
          defaultSize={900}
          minSize={100}
          maxSize={600}
        >
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
      await waitForOpen();

      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
      await expect
        .poll(() => handle().getAttribute("aria-valuenow"))
        .toBe("600");
    });

    it("brings the size back within range when maxSize tightens", async () => {
      function LimitFixture({ maxSize }: { maxSize: number }) {
        return (
          <Drawer
            open
            resizable
            position="left"
            defaultSize={500}
            minSize={100}
            maxSize={maxSize}
          >
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>Content</DrawerContent>
          </Drawer>
        );
      }

      const { rerender } = await renderWithSalt(<LimitFixture maxSize={600} />);
      await waitForOpen();
      await expect.poll(() => drawerSize("left")).toBeCloseTo(500, 0);

      await act(async () => {
        rerender(<LimitFixture maxSize={300} />);
      });

      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
    });
  });

  describe("handle borders", () => {
    const strip = () => getComputedStyle(handle(), "::before");

    it("renders no borders by default", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      expect(strip().borderLeftWidth).toBe("0px");
      expect(strip().borderRightWidth).toBe("0px");
    });

    it("renders the requested sides without growing the strip", async () => {
      await renderWithSalt(
        <ResizableFixture
          position="left"
          resizeHandleBorders={["left", "right"]}
        />,
      );
      await waitForOpen();

      expect(strip().borderLeftWidth).toBe("1px");
      expect(strip().borderRightWidth).toBe("1px");
      expect(strip().borderLeftStyle).toBe("solid");
      // Borders are drawn inside the strip, so it stays the reserved size.
      expect(strip().width).toBe(`${HANDLE_SIZE}px`);
      expect(paddingOf("right")).toBeCloseTo(HANDLE_SIZE, 1);
    });

    it("ignores sides that do not run along the handle", async () => {
      await renderWithSalt(
        <ResizableFixture
          position="left"
          resizeHandleBorders={["top", "bottom"]}
        />,
      );
      await waitForOpen();

      expect(strip().borderTopWidth).toBe("0px");
      expect(strip().borderBottomWidth).toBe("0px");
    });

    it("supports the horizontal sides for a bottom Drawer", async () => {
      await renderWithSalt(
        <ResizableFixture position="bottom" resizeHandleBorders={["top"]} />,
      );
      await waitForOpen();

      expect(strip().borderTopWidth).toBe("1px");
      expect(strip().height).toBe(`${HANDLE_SIZE}px`);
    });
  });

  describe("interaction with drawer content", () => {
    it("leaves content controls clickable", async () => {
      let clicked = false;
      await renderWithSalt(
        <Drawer open resizable position="left" style={{ width: 300 }}>
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>
            <Button
              onClick={() => {
                clicked = true;
              }}
            >
              Action
            </Button>
          </DrawerContent>
        </Drawer>,
      );
      await waitForOpen();

      await page.getByRole("button", { name: "Action" }).click();
      expect(clicked).toBe(true);
    });
  });
});
