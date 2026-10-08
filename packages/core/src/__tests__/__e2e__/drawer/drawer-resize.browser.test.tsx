import type { DrawerProps } from "@salt-ds/core";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Link,
} from "@salt-ds/core";
import { type CSSProperties, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { act, renderWithSalt } from "~browser-test-utils/render";

type Position = NonNullable<DrawerProps["position"]>;

const POSITIONS: Position[] = ["left", "right", "top", "bottom"];

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

async function waitForOpen() {
  await expect.element(page.getByRole("dialog")).toBeVisible();
  await expect.poll(() => drawer().getAnimations().length).toBe(0);
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

async function clickHandle(init?: PointerEventInit) {
  const { x, y } = handleCenter();
  await dispatchPointer(handle(), "pointerdown", x, y, init);
  await dispatchPointer(handle(), "pointerup", x, y, init);
}

const targetAt = (x: number, y: number) =>
  document.elementFromPoint(x, y) ?? document.body;

async function dispatchClick(
  target: EventTarget,
  clientX: number,
  clientY: number,
) {
  await act(async () => {
    target.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        composed: true,
        button: 0,
        clientX,
        clientY,
      }),
    );
  });
}

async function clickAt(
  { x, y }: { x: number; y: number },
  init?: PointerEventInit,
) {
  const target = targetAt(x, y);
  await dispatchPointer(target, "pointerdown", x, y, init);
  await dispatchPointer(target, "pointerup", x, y, init);
  await dispatchClick(target, x, y);
}

async function hoverAt({ x, y }: { x: number; y: number }) {
  await dispatchPointer(targetAt(x, y), "pointermove", x, y, { buttons: 0 });
}

const guide = () =>
  document.querySelector<HTMLElement>(".saltDrawerResizeGuide");

const guideOffset = () =>
  Number.parseFloat(
    guide()?.style.getPropertyValue("--drawerResizeGuide-offset") ?? "",
  );

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

function ContentFixture({
  onAction,
  onLinkClick,
}: {
  onAction: () => void;
  onLinkClick: () => void;
}) {
  return (
    <Drawer open resizable style={limitsStyle("left")}>
      <DrawerHeader header="Resizable drawer" />
      <DrawerContent>
        <Button onClick={onAction}>Action</Button>
        <Link href="#placing-link" onClick={onLinkClick}>
          Details
        </Link>
      </DrawerContent>
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
      await dispatchPointer(document, "pointermove", start.x + 150, start.y);

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

    it("resizes when dragged from just outside its edge", async () => {
      await renderWithSalt(<DismissibleFixture />);
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const x = rect.right + 5;
      const y = rect.top + 120;
      await dispatchPointer(
        document.elementFromPoint(x, y) as Element,
        "pointerdown",
        x,
        y,
      );
      await dispatchPointer(document, "pointermove", x + 50, y);
      await dispatchPointer(document, "pointerup", x + 50, y);

      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
      await expect.poll(() => drawerSize("left")).toBeCloseTo(350, 0);
    });

    it("dismisses rather than resizes on a press further outside the drawer", async () => {
      await renderWithSalt(<DismissibleFixture />);
      await waitForOpen();

      const rect = drawer().getBoundingClientRect();
      const x = rect.right + 40;
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

  describe("click to place", () => {
    for (const position of POSITIONS) {
      it(`places the edge where the next click lands, position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

        await clickHandle();
        await clickAt(pointForSize(position, 450));

        await expect.poll(() => drawerSize(position)).toBeCloseTo(450, 0);
      });
    }

    it("doesn't resize until the next click", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      await hoverAt(pointForSize("left", 420));
      await hoverAt(pointForSize("left", 900));
      expect(drawerSize("left")).toBeCloseTo(300, 0);

      await clickAt(pointForSize("left", 450));
      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
    });

    it("places the edge on release, not on press", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      const { x, y } = pointForSize("left", 450);
      const target = targetAt(x, y);
      await dispatchPointer(target, "pointerdown", x, y);
      expect(drawerSize("left")).toBeCloseTo(300, 0);

      await dispatchPointer(target, "pointerup", x, y);
      await dispatchClick(target, x, y);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
    });

    it("keeps the placed size within the limits", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      await clickAt(pointForSize("left", 900));

      await expect.poll(() => drawerSize("left")).toBeCloseTo(600, 0);
    });

    it("treats a slightly shaky click as a click", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      const start = handleCenter();
      await dispatchPointer(handle(), "pointerdown", start.x, start.y);
      await dispatchPointer(handle(), "pointermove", start.x + 2, start.y);
      await dispatchPointer(handle(), "pointerup", start.x + 2, start.y);
      expect(drawerSize("left")).toBeCloseTo(300, 0);

      await clickAt(pointForSize("left", 450));
      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
    });

    it("drags instead of placing when the press moves further", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await dragHandleBy("left", 20);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(320, 0);

      await clickAt(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(320, 0);
    });

    it("places the edge with a second tap on touch", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      const touch = { pointerType: "touch" };
      await clickHandle(touch);
      await clickAt(pointForSize("left", 450), touch);

      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
    });

    it("cancels with Escape without closing the drawer", async () => {
      await renderWithSalt(<DismissibleFixture />);
      await waitForOpen();

      await clickHandle();
      await hoverAt(pointForSize("left", 450));
      await userEvent.keyboard("{Escape}");

      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("stops placing on another key, which still works", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      await pressOnHandle("{ArrowRight}");
      await expect.poll(() => drawerSize("left")).toBeCloseTo(308, 0);

      await clickAt(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(308, 0);
    });

    it("cancels on a secondary button press", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      const { x, y } = pointForSize("left", 450);
      await dispatchPointer(targetAt(x, y), "pointerdown", x, y, {
        button: 2,
        buttons: 2,
      });

      await clickAt(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("cancels when the window loses focus", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      await act(async () => {
        window.dispatchEvent(new FocusEvent("blur"));
      });

      await clickAt(pointForSize("left", 450));
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("shows the resize cursor while placing", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      await hoverAt(pointForSize("left", 450));
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("ew-resize");

      await userEvent.keyboard("{Escape}");
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
    });

    it("doesn't close the drawer when the edge is placed on the scrim", async () => {
      await renderWithSalt(<DismissibleFixture />);
      await waitForOpen();

      await page.getByRole("separator", { name: "Resize drawer" }).click();
      await page
        .getByTestId("scrim")
        .click({ force: true, position: { x: 450, y: 300 } });

      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    });

    it("doesn't activate content where the edge is placed", async () => {
      const onAction = vi.fn();
      const onLinkClick = vi.fn();
      const { hash } = window.location;
      await renderWithSalt(
        <ContentFixture onAction={onAction} onLinkClick={onLinkClick} />,
      );
      await waitForOpen();
      const separator = page.getByRole("separator", { name: "Resize drawer" });
      const action = page.getByRole("button", { name: "Action" });
      const link = page.getByRole("link", { name: "Details" });

      const placingEnded = () =>
        expect.poll(() => getComputedStyle(document.body).cursor).toBe("auto");

      await separator.click();
      await action.click({ force: true });
      await placingEnded();
      await expect.poll(() => drawerSize("left")).toBeCloseTo(100, 0);

      await separator.click();
      await link.click({ force: true });
      await placingEnded();

      expect(onAction).not.toHaveBeenCalled();
      expect(onLinkClick).not.toHaveBeenCalled();
      expect(window.location.hash).toBe(hash);
      await expect.element(separator).toHaveFocus();

      await action.click();
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it("keeps the size when cancelled or placed at the current edge", async () => {
      await renderWithSalt(<DismissibleFixture />);
      await waitForOpen();

      await clickHandle();
      await userEvent.keyboard("{Escape}");
      await clickHandle();
      await clickAt(pointForSize("left", 300));

      expect(drawerSize("left")).toBeCloseTo(300, 0);
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    });

    it("keeps the size when the handle is clicked again, as in a double-click", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      await clickAt(handleCenter());

      await expect.poll(guide).toBeNull();
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("keeps the size when clicked just outside the edge, within the handle's target", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      const { y } = handleCenter();
      await clickAt({ x: drawer().getBoundingClientRect().right + 4, y });

      await expect.poll(guide).toBeNull();
      expect(drawerSize("left")).toBeCloseTo(300, 0);
    });

    it("snaps the guide line to the edge while over the handle", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await clickHandle();
      await hoverAt(pointForSize("left", 450));
      await expect
        .poll(guideOffset)
        .toBeCloseTo(drawer().getBoundingClientRect().left + 450, 0);

      await hoverAt(handleCenter());
      await expect
        .poll(guideOffset)
        .toBeCloseTo(drawer().getBoundingClientRect().right, 0);
    });

    it("places the edge when dismissing is disabled", async () => {
      await renderWithSalt(<ResizableFixture disableDismiss />);
      await waitForOpen();

      await clickHandle();
      await clickAt(pointForSize("left", 450));

      await expect.poll(() => drawerSize("left")).toBeCloseTo(450, 0);
      await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    });

    it("cancels when the window is resized", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      try {
        await clickHandle();
        await expect.poll(guide).not.toBeNull();
        await page.viewport(1000, 800);
        await expect.poll(guide).toBeNull();

        await clickAt(pointForSize("left", 450));
        expect(drawerSize("left")).toBeCloseTo(300, 0);
      } finally {
        await page.viewport(1280, 1024);
      }
    });

    it("stops placing when the drawer closes", async () => {
      let setOpen: (open: boolean) => void = () => {};
      function ClosableFixture() {
        const [open, setOpenState] = useState(true);
        setOpen = setOpenState;
        return <ResizableFixture open={open} />;
      }
      await renderWithSalt(<ClosableFixture />);
      await waitForOpen();

      await clickHandle();
      await expect.poll(guide).not.toBeNull();
      await act(async () => setOpen(false));

      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await expect.poll(guide).toBeNull();
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
    });

    it("stops placing when resizing is turned off", async () => {
      let setResizable: (resizable: boolean) => void = () => {};
      function ToggleFixture() {
        const [resizable, setResizableState] = useState(true);
        setResizable = setResizableState;
        return <ResizableFixture resizable={resizable} />;
      }
      await renderWithSalt(<ToggleFixture />);
      await waitForOpen();

      await clickHandle();
      await expect.poll(guide).not.toBeNull();
      await act(async () => setResizable(false));

      await expect.poll(guide).toBeNull();
      await expect
        .poll(() => getComputedStyle(document.body).cursor)
        .toBe("auto");
      await expect
        .element(page.getByRole("separator", { name: "Resize drawer" }))
        .not.toBeInTheDocument();
    });
  });

  describe("user size", () => {
    it("keeps the user's size when closed and reopened", async () => {
      function ReopenFixture() {
        const [open, setOpen] = useState(true);
        return (
          <>
            <Button onClick={() => setOpen(true)}>Open</Button>
            <Drawer
              open={open}
              resizable
              style={limitsStyle("left")}
              disableScrim
            >
              <DrawerHeader header="Resizable drawer" />
              <DrawerContent>
                <Button onClick={() => setOpen(false)}>Close</Button>
              </DrawerContent>
            </Drawer>
          </>
        );
      }
      await renderWithSalt(<ReopenFixture />);
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await page.getByRole("button", { name: "Close" }).click();
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await page.getByRole("button", { name: "Open" }).click();
      await waitForOpen();

      expect(drawerSize("left")).toBeCloseTo(400, 0);
      expect(handle().getAttribute("aria-valuenow")).toBe("400");
    });

    it("keeps the user's size when the style size changes", async () => {
      function StyleFixture() {
        const [width, setWidth] = useState(300);
        return (
          <Drawer
            open
            resizable
            style={{ width, minWidth: 100, maxWidth: 600 }}
          >
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>
              <Button onClick={() => setWidth(200)}>Change width</Button>
            </DrawerContent>
          </Drawer>
        );
      }
      await renderWithSalt(<StyleFixture />);
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await page.getByRole("button", { name: "Change width" }).click();

      expect(drawerSize("left")).toBeCloseTo(400, 0);
    });

    it("starts again from the style size when remounted with a new key", async () => {
      function KeyFixture() {
        const [key, setKey] = useState(0);
        return (
          <Drawer key={key} open resizable style={limitsStyle("left")}>
            <DrawerHeader header="Resizable drawer" />
            <DrawerContent>
              <Button onClick={() => setKey((current) => current + 1)}>
                Reset
              </Button>
            </DrawerContent>
          </Drawer>
        );
      }
      await renderWithSalt(<KeyFixture />);
      await waitForOpen();

      await dragHandleBy("left", 100);
      await expect.poll(() => drawerSize("left")).toBeCloseTo(400, 0);

      await page.getByRole("button", { name: "Reset" }).click();
      await waitForOpen();

      await expect.poll(() => drawerSize("left")).toBeCloseTo(300, 0);
      await expect
        .poll(() => handle().getAttribute("aria-valuenow"))
        .toBe("300");
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

  describe("overflowing content", () => {
    const inner = () =>
      drawer().querySelector<HTMLElement>(".saltDrawer-inner") as HTMLElement;

    const overlaps = (a: DOMRect, b: DOMRect) =>
      a.left < b.right - 0.5 &&
      b.left < a.right - 0.5 &&
      a.top < b.bottom - 0.5 &&
      b.top < a.bottom - 0.5;

    const edgeOffset = (position: Position) => {
      const drawerRect = drawer().getBoundingClientRect();
      const handleRect = handle().getBoundingClientRect();
      switch (position) {
        case "left":
          return drawerRect.right - handleRect.right;
        case "right":
          return handleRect.left - drawerRect.left;
        case "top":
          return drawerRect.bottom - handleRect.bottom;
        default:
          return handleRect.top - drawerRect.top;
      }
    };

    for (const position of POSITIONS) {
      it(`scrolls inside, clear of the handle, position=${position}`, async () => {
        await renderWithSalt(
          <Drawer
            open
            resizable
            position={position}
            style={limitsStyle(position)}
          >
            <div style={{ width: 2000, height: 2000, flexShrink: 0 }}>
              Content
            </div>
          </Drawer>,
        );
        await waitForOpen();

        const scroller = inner();
        expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
        expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
        expect(drawer().scrollHeight).toBe(drawer().clientHeight);
        expect(drawer().scrollWidth).toBe(drawer().clientWidth);
        expect(
          overlaps(
            handle().getBoundingClientRect(),
            scroller.getBoundingClientRect(),
          ),
        ).toBe(false);

        const { scrollWidth, scrollHeight } = scroller;
        const { left, top } = handle().getBoundingClientRect();
        scroller.scrollLeft = scrollWidth;
        scroller.scrollTop = scrollHeight;
        await expect.poll(() => scroller.scrollTop).toBeGreaterThan(0);

        expect(scroller.scrollWidth).toBe(scrollWidth);
        expect(scroller.scrollHeight).toBe(scrollHeight);
        expect(handle().getBoundingClientRect().left).toBe(left);
        expect(handle().getBoundingClientRect().top).toBe(top);
        expect(edgeOffset(position)).toBeCloseTo(0, 0);
      });
    }

    it("scrolls the sections together when they don't fit", async () => {
      await renderWithSalt(
        <Drawer
          open
          resizable
          style={
            { width: 300, "--saltDrawer-maxHeight": "120px" } as CSSProperties
          }
        >
          <DrawerHeader header="Resizable drawer" description="Description" />
          <DrawerContent>Content</DrawerContent>
          <DrawerFooter>
            <Button>Save</Button>
          </DrawerFooter>
        </Drawer>,
      );
      await waitForOpen();

      const scroller = inner();
      expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
      expect(drawer().scrollHeight).toBe(drawer().clientHeight);
      expect(
        overlaps(
          handle().getBoundingClientRect(),
          scroller.getBoundingClientRect(),
        ),
      ).toBe(false);
    });
  });
});
