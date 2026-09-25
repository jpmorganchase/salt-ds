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

/**
 * A Drawer mounts translated off-screen and slides in, so geometry reads are
 * meaningless until the animation has settled.
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

const sizeStyle = (position: Position) =>
  isHorizontal(position)
    ? { width: 300, minWidth: 100, maxWidth: 600 }
    : { height: 300, minHeight: 100, maxHeight: 600 };

/**
 * Includes a focusable control, so the separator does not receive the initial
 * focus that `FloatingFocusManager` gives the first tabbable element.
 */
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
        position="left"
        style={{ width: 300, minWidth: 100, maxWidth: 600 }}
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
      it(`exposes a separator with the ${ORIENTATION[position]} orientation when position=${position}`, async () => {
        await renderWithSalt(<ResizableFixture position={position} />);
        await waitForOpen();

        await expect.element(separator()).toBeInTheDocument();
        await expect
          .element(separator())
          .toHaveAttribute("aria-orientation", ORIENTATION[position]);
      });
    }

    it("describes its value before any interaction", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      // A focusable separator must always expose a value.
      await expect.element(separator()).toHaveAttribute("aria-valuenow", "300");
      await expect.element(separator()).toHaveAttribute("aria-valuemin", "100");
      await expect.element(separator()).toHaveAttribute("aria-valuemax", "600");
      await expect
        .element(separator())
        .toHaveAttribute("aria-valuetext", "300 pixels");
    });

    it("reports the resolved limits for a vertical Drawer", async () => {
      await renderWithSalt(<ResizableFixture position="top" />);
      await waitForOpen();

      await expect.element(separator()).toHaveAttribute("aria-valuenow", "300");
      await expect.element(separator()).toHaveAttribute("aria-valuemin", "100");
      await expect.element(separator()).toHaveAttribute("aria-valuemax", "600");
    });

    it("updates its value after a keyboard resize", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      handle().focus();
      await userEvent.keyboard("{ArrowRight}");

      await expect.element(separator()).toHaveAttribute("aria-valuenow", "308");
      await expect
        .element(separator())
        .toHaveAttribute("aria-valuetext", "308 pixels");
    });

    it("updates its value after a pointer resize", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const rect = handle().getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;

      await dispatchPointer(handle(), "pointerdown", startX, startY);
      await dispatchPointer(handle(), "pointermove", startX + 50, startY);
      await dispatchPointer(handle(), "pointerup", startX + 50, startY);

      await expect
        .poll(() =>
          Number(handle().getAttribute("aria-valuenow") ?? Number.NaN),
        )
        .toBeCloseTo(350, 0);
    });

    it("points at the drawer it controls", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const dialogId = page.getByRole("dialog").element().id;
      expect(dialogId).toBeTruthy();
      await expect
        .element(separator())
        .toHaveAttribute("aria-controls", dialogId);
    });

    it("uses only ARIA attributes permitted on a separator", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const permitted = new Set([
        "aria-label",
        "aria-controls",
        "aria-orientation",
        "aria-valuenow",
        "aria-valuemin",
        "aria-valuemax",
        "aria-valuetext",
      ]);
      const used = Array.from(handle().attributes)
        .map((attribute) => attribute.name)
        .filter((name) => name.startsWith("aria-"));

      expect(used.length).toBeGreaterThan(0);
      for (const name of used) {
        expect(permitted.has(name)).toBe(true);
      }
    });
  });

  describe("focus management", () => {
    it("is reachable by keyboard after the drawer content", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await expect
        .element(page.getByRole("button", { name: "Close drawer" }))
        .toHaveFocus();

      await userEvent.tab();
      await expect.element(separator()).toHaveFocus();
    });

    it("keeps focus trapped within the modal drawer", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      const closeButton = page.getByRole("button", { name: "Close drawer" });
      await expect.element(closeButton).toHaveFocus();

      await userEvent.tab();
      await expect.element(separator()).toHaveFocus();

      // Tabbing past the last element returns to the first, rather than
      // escaping to the page behind the modal.
      await userEvent.tab();
      await expect.element(closeButton).toHaveFocus();
    });

    it("shows a focus indicator on the separator", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      handle().focus();
      const strip = getComputedStyle(handle(), "::before");
      expect(strip.outlineStyle).not.toBe("none");
      expect(Number.parseFloat(strip.outlineWidth)).toBeGreaterThan(0);
    });

    it("stays modal and named while resizable", async () => {
      await renderWithSalt(<ResizableFixture position="left" />);
      await waitForOpen();

      await expect
        .element(page.getByRole("dialog"))
        .toHaveAttribute("aria-modal", "true");
      await expect
        .element(page.getByRole("dialog", { name: "Resizable drawer" }))
        .toBeInTheDocument();
    });

    it("returns focus to the trigger after a resized drawer closes", async () => {
      await renderWithSalt(<TriggeredDrawer />);

      const trigger = page.getByRole("button", { name: "Open Drawer" });
      await trigger.click();
      await waitForOpen();

      handle().focus();
      await userEvent.keyboard("{ArrowRight}");
      await expect.element(separator()).toHaveAttribute("aria-valuenow", "308");

      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      await expect.element(trigger).toHaveFocus();
    });

    it("keeps background content inert while open", async () => {
      await renderWithSalt(<TriggeredDrawer />);

      const trigger = page.getByRole("button", { name: "Open Drawer" });
      await trigger.click();
      await waitForOpen();

      await expect
        .poll(() => trigger.element().closest("[inert]") !== null)
        .toBe(true);
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
        const { container } = await renderWithSalt(
          <ResizableFixture position="left" />,
        );
        await waitForOpen();

        const rect = handle().getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        await dispatchPointer(handle(), "pointerdown", startX, startY);
        await dispatchPointer(handle(), "pointermove", startX + 30, startY);
        await expect
          .poll(() => handle().hasAttribute("data-resizing"))
          .toBe(true);

        await runAxeScan(container);

        await dispatchPointer(handle(), "pointerup", startX + 30, startY);
      },
      AXE_TIMEOUT,
    );
  });
});
