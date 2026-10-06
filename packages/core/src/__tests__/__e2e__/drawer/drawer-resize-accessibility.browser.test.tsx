import type { DrawerProps } from "@salt-ds/core";
import { Button, Drawer, DrawerContent, DrawerHeader } from "@salt-ds/core";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { act, renderWithSalt } from "~browser-test-utils/render";

type Position = NonNullable<DrawerProps["position"]>;

const POSITIONS: Position[] = ["left", "right", "top", "bottom"];

const ORIENTATION = {
  left: "vertical",
  right: "vertical",
  top: "horizontal",
  bottom: "horizontal",
} as const;

const isHorizontal = (position: Position) =>
  position === "left" || position === "right";

const separator = () => page.getByRole("separator", { name: "Resize drawer" });

const drawer = () => page.getByRole("dialog").element() as HTMLElement;

const valueNow = () =>
  Number(separator().element().getAttribute("aria-valuenow"));

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

function handleCenter() {
  const rect = separator().element().getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

async function tabToSeparator() {
  await expect
    .element(page.getByRole("button", { name: "Close drawer" }))
    .toHaveFocus();
  await userEvent.tab();
  await expect.element(separator()).toHaveFocus();
}

const limitsStyle = (position: Position) =>
  isHorizontal(position)
    ? { width: 300, minWidth: 100, maxWidth: 600 }
    : { height: 300, minHeight: 100, maxHeight: 600 };

// The close button takes initial focus, so the separator isn't focused on open.
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
      <DrawerHeader
        header="Resizable drawer"
        actions={<Button aria-label="Close drawer">Close</Button>}
      />
      <DrawerContent>Content</DrawerContent>
    </Drawer>
  );
}

function TriggeredDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        resizable
        style={limitsStyle("left")}
      >
        <DrawerHeader
          header="Resizable drawer"
          actions={
            <Button aria-label="Close drawer" onClick={() => setOpen(false)}>
              Close
            </Button>
          }
        />
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    </>
  );
}

describe("GIVEN a resizable Drawer", () => {
  describe("separator semantics", () => {
    for (const position of POSITIONS) {
      it(`exposes a ${ORIENTATION[position]} separator when position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

        await expect
          .element(separator())
          .toHaveAttribute("aria-orientation", ORIENTATION[position]);
      });

      it(`reports its size and limits before any interaction, position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

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
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await tabToSeparator();
      await userEvent.keyboard("{ArrowRight}");

      await expect.poll(valueNow).toBeGreaterThan(300);
      expect(valueNow()).toBeCloseTo(drawer().getBoundingClientRect().width, 0);
    });

    it("updates its value after a pointer resize", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      const { x, y } = handleCenter();
      await dispatchPointer(separator().element(), "pointerdown", x, y);
      await dispatchPointer(separator().element(), "pointermove", x + 50, y);
      await dispatchPointer(separator().element(), "pointerup", x + 50, y);

      await expect.poll(valueNow).toBeCloseTo(350, 0);
    });

    it("updates its value after the edge is placed by a click", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      const { x, y } = handleCenter();
      await dispatchPointer(separator().element(), "pointerdown", x, y);
      await dispatchPointer(separator().element(), "pointerup", x, y);
      const target = document.elementFromPoint(450, y) ?? document.body;
      await dispatchPointer(target, "pointerdown", 450, y);
      await dispatchPointer(target, "pointerup", 450, y);

      await expect.poll(valueNow).toBeCloseTo(450, 0);
    });

    it("updates its maximum when the viewport resizes", async () => {
      await renderWithSalt(
        <Drawer open resizable style={{ width: 300 }}>
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
      await waitForOpen();
      await expect
        .element(separator())
        .toHaveAttribute("aria-valuemax", String(window.innerWidth));

      try {
        await page.viewport(900, 700);
        await expect
          .element(separator())
          .toHaveAttribute("aria-valuemax", "900");
      } finally {
        await page.viewport(1280, 1024);
      }
    });

    it("points at the drawer it controls", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await expect
        .element(separator())
        .toHaveAttribute("aria-controls", drawer().id);
    });
  });

  describe("focus management", () => {
    it("is reachable by keyboard within the drawer's focus trap", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await tabToSeparator();

      await userEvent.tab();
      await expect
        .element(page.getByRole("button", { name: "Close drawer" }))
        .toHaveFocus();
    });

    it("shows a focus indicator when focused with the keyboard", async () => {
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

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
      await renderWithSalt(<ResizableFixture />);
      await waitForOpen();

      await separator().click();
      await page
        .getByTestId("scrim")
        .click({ force: true, position: { x: 450, y: 300 } });
      await expect.poll(valueNow).toBeCloseTo(450, 0);

      await expect.element(separator()).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.poll(valueNow).toBeCloseTo(458, 0);
    });

    it("returns focus to the trigger after a resized drawer closes", async () => {
      await renderWithSalt(<TriggeredDrawer />);

      const trigger = page.getByRole("button", { name: "Open Drawer" });
      await trigger.click();
      await waitForOpen();

      await tabToSeparator();
      await userEvent.keyboard("{ArrowRight}");
      await expect.poll(valueNow).toBeGreaterThan(300);

      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await expect.element(trigger).toHaveFocus();
    });
  });

  describe("axe", () => {
    const AXE_TIMEOUT = 30_000;

    for (const position of POSITIONS) {
      it(
        `has no violations when position=${position}`,
        async () => {
          const { container } = await renderWithSalt(
            <ResizableFixture position={position} />,
          );
          await waitForOpen();

          await runAxeScan(container);
        },
        AXE_TIMEOUT,
      );
    }

    it(
      "has no violations while resizing",
      async () => {
        const { container } = await renderWithSalt(<ResizableFixture />);
        await waitForOpen();

        const { x, y } = handleCenter();
        await dispatchPointer(separator().element(), "pointerdown", x, y);
        await dispatchPointer(separator().element(), "pointermove", x + 30, y);
        await expect.poll(valueNow).toBeCloseTo(330, 0);

        await runAxeScan(container);

        await dispatchPointer(separator().element(), "pointerup", x + 30, y);
      },
      AXE_TIMEOUT,
    );

    it(
      "has no violations while placing the edge by click",
      async () => {
        const { container } = await renderWithSalt(<ResizableFixture />);
        await waitForOpen();

        const { x, y } = handleCenter();
        await dispatchPointer(separator().element(), "pointerdown", x, y);
        await dispatchPointer(separator().element(), "pointerup", x, y);
        await dispatchPointer(document, "pointermove", 450, y);
        await expect
          .poll(() => getComputedStyle(document.body).cursor)
          .toBe("ew-resize");

        await runAxeScan(container);
      },
      AXE_TIMEOUT,
    );
  });
});
