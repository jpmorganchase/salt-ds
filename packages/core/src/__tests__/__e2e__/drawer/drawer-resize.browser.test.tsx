import type { DrawerProps } from "@salt-ds/core";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  SaltProvider,
} from "@salt-ds/core";
import { type CSSProperties, useState } from "react";
import { describe, expect, it, vi } from "vitest";
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

const sizeStyle = (position: Position) =>
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
      style={sizeStyle(position)}
      {...rest}
    >
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
      style={sizeStyle(position)}
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
        const expected = sizeStyle(position);

        expect(isHorizontal(position) ? rect.width : rect.height).toBeCloseTo(
          300,
          1,
        );
        expect(rect.width).toBeGreaterThan(0);
        expect(expected).toBeTruthy();

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

      // Past the 6px visible strip, but inside the pointer target (6px + --salt-spacing-100).
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

    it("does not resize from a press just outside the edge", async () => {
      await renderWithSalt(<DismissibleFixture position="left" />);
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const y = rect.top + 120;
      const startX = rect.right + 3;
      const target = document.elementFromPoint(startX, y);
      expect(target).not.toBe(handle());

      await dispatchPointer(target as Element, "pointerdown", startX, y);

      expect(document.documentElement.style.cursor).toBe("");
      await expect.poll(() => document.querySelector(".saltDrawer")).toBeNull();
    });

    it("still dismisses on a press well outside the edge", async () => {
      await renderWithSalt(<DismissibleFixture position="left" />);
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const y = rect.top + 120;
      const farX = rect.right + 200;
      const target = document.elementFromPoint(farX, y);

      await dispatchPointer(target as Element, "pointerdown", farX, y);

      await expect.poll(() => document.querySelector(".saltDrawer")).toBeNull();
    });

    it("clamps to the CSS maximum", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await dragHandleBy("left", 900);

      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
    });

    it("clamps to the CSS minimum", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await dragHandleBy("left", -900);

      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);
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

    it("collapses and restores with Enter", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await pressOnHandle("{Enter}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await pressOnHandle("{Enter}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("restores the size before Home with Enter", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await pressOnHandle("{ArrowRight}");
      await pressOnHandle("{Home}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await pressOnHandle("{Enter}");
      await expect
        .poll(() => drawerSize("left"))
        .toBeCloseTo(300 + KEYBOARD_STEP, 0);
    });

    it("ignores keys that do not resize", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await pressOnHandle("{ArrowUp}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
    });
  });

  describe("onResizeStop", () => {
    it("reports the new size once when a drag ends", async () => {
      const onResizeStop = vi.fn();
      await renderWithSalt(<ResizableFixture onResizeStop={onResizeStop} />);
      await waitForOpen();

      await dragHandleBy("left", 50);

      expect(onResizeStop).toHaveBeenCalledTimes(1);
      expect(onResizeStop.mock.calls[0][1]).toBeCloseTo(350, 0);
    });

    it("reports the new size after a keyboard resize", async () => {
      const onResizeStop = vi.fn();
      await renderWithSalt(<ResizableFixture onResizeStop={onResizeStop} />);
      await waitForOpen();

      await pressOnHandle("{ArrowRight}");

      expect(onResizeStop).toHaveBeenCalledTimes(1);
      expect(onResizeStop.mock.calls[0][1]).toBeCloseTo(300 + KEYBOARD_STEP, 0);
    });

    it("is not called when the size does not change", async () => {
      const onResizeStop = vi.fn();
      await renderWithSalt(<ResizableFixture onResizeStop={onResizeStop} />);
      await waitForOpen();

      await pressOnHandle("{End}");
      onResizeStop.mockClear();
      await pressOnHandle("{End}");
      await dragHandleBy("left", 0);

      expect(onResizeStop).not.toHaveBeenCalled();
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

  describe("size limits", () => {
    // Default minimum: 8 × --salt-size-base for width, 4 × for height.
    const DEFAULT_MIN = { horizontal: 8, vertical: 4 };
    const sizeBase = () =>
      Number.parseFloat(
        getComputedStyle(drawer()).getPropertyValue("--salt-size-base"),
      );
    const defaultMin = (position: Position) =>
      sizeBase() *
      (isHorizontal(position) ? DEFAULT_MIN.horizontal : DEFAULT_MIN.vertical);

    for (const position of POSITIONS) {
      it(`keeps a default minimum when no limits are set, position=${position}`, async () => {
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

        await dragHandleBy(
          position,
          position === "left" || position === "top" ? -2000 : 2000,
        );

        await expect
          .poll(() => drawerSize(position))
          .toBeCloseTo(defaultMin(position), 0);
      });
    }

    it("scales the default minimum with density", async () => {
      await renderWithSalt(
        <SaltProvider density="high">
          <Drawer open resizable position="left" style={{ width: 320 }}>
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>Content</DrawerContent>
          </Drawer>
        </SaltProvider>,
      );
      await waitForOpen();

      await dragHandleBy("left", -2000);

      expect(sizeBase()).toBe(20);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(160, 0);
    });

    it("accepts the limits as CSS variables", async () => {
      await renderWithSalt(
        <Drawer
          open
          resizable
          position="top"
          style={
            {
              height: 300,
              "--saltDrawer-minSize": "10vh",
              "--saltDrawer-maxSize": "50vh",
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

    it("never collapses to zero, even with a zero minimum and no padding", async () => {
      await renderWithSalt(
        <Drawer
          open
          resizable
          position="left"
          style={
            {
              width: 300,
              padding: 0,
              "--saltDrawer-minSize": "0px",
            } as CSSProperties
          }
        >
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
      await waitForOpen();

      await dragHandleBy("left", -2000);

      await expect.poll(() => drawerSize("left")).toBeCloseTo(sizeBase(), 0);
      const rect = handle().getBoundingClientRect();
      expect(
        document.elementFromPoint(rect.right - 2, rect.top + rect.height / 2),
      ).toBe(handle());
    });
  });

  describe("lifecycle", () => {
    it("cleans up when the Drawer closes mid-drag", async () => {
      await renderWithSalt(<DismissibleFixture position="left" />);
      await waitForOpen();

      const rect = handle().getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      await dispatchPointer(handle(), "pointerdown", x, y);
      await dispatchPointer(handle(), "pointermove", x + 40, y);
      expect(document.body.style.cursor).toBe("ew-resize");

      await userEvent.keyboard("{Escape}");
      await expect.poll(() => document.querySelector(".saltDrawer")).toBeNull();

      expect(document.body.style.cursor).toBe("");
    });

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
      await expect.element(handle()).toHaveAttribute("aria-valuenow", "200");
    });

    it("updates its limits when the viewport resizes", async () => {
      await renderWithSalt(
        <Drawer open resizable position="left" style={{ width: 300 }}>
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
      await waitForOpen();
      await expect
        .element(handle())
        .toHaveAttribute("aria-valuemax", String(window.innerWidth));

      try {
        await page.viewport(900, 700);
        await expect.element(handle()).toHaveAttribute("aria-valuemax", "900");
      } finally {
        await page.viewport(1280, 1024);
      }
    });

    it("keeps the handle on the edge of a scrolled unsectioned Drawer", async () => {
      await renderWithSalt(
        <Drawer open resizable position="left" style={{ width: 300 }}>
          <p>{"Unsectioned content. ".repeat(600)}</p>
        </Drawer>,
      );
      await waitForOpen();

      const before = handle().getBoundingClientRect();
      await act(async () => {
        drawer().scrollTop = 500;
        drawer().dispatchEvent(new Event("scroll"));
      });

      await expect
        .poll(() => handle().getBoundingClientRect().top)
        .toBeCloseTo(before.top, 0);
    });
  });

  describe("input handling", () => {
    it("ignores a non-primary pointer", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const rect = handle().getBoundingClientRect();
      await act(async () => {
        handle().dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientX: rect.left + 3,
            clientY: rect.top + 50,
            isPrimary: false,
            pointerId: 2,
            pointerType: "touch",
          }),
        );
      });

      expect(handle()).not.toHaveAttribute("data-resizing");
      expect(document.body.style.cursor).toBe("");
    });

    it("uses density-aware keyboard steps", async () => {
      await renderWithSalt(
        <SaltProvider density="high">
          <ResizableFixture position="left" />
        </SaltProvider>,
      );
      await waitForOpen();
      const step = Number.parseFloat(
        getComputedStyle(drawer()).getPropertyValue("--salt-spacing-100"),
      );
      expect(step).toBe(4);

      await pressOnHandle("{ArrowRight}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(300 + step, 0);

      await pressOnHandle("{Shift>}{ArrowRight}{/Shift}");
      await expect
        .poll(() => drawerSize("left"))
        .toBeCloseTo(300 + step + step * 5, 0);
    });

    it("draws the focus ring inside the strip", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      handle().focus();
      await expect.poll(() => document.activeElement).toBe(handle());
      const strip = getComputedStyle(handle(), "::before");
      expect(Number.parseFloat(strip.outlineOffset)).toBeCloseTo(
        -Number.parseFloat(strip.outlineWidth),
        1,
      );
      expect(getComputedStyle(drawer()).overflow).toBe("auto");
    });
  });
});
