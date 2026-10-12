import type { DrawerProps } from "@salt-ds/core";
import { Drawer, DrawerContent, DrawerHeader } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { mouse } from "~browser-test-utils/pointer";
import { renderWithSalt } from "~browser-test-utils/render";
import * as drawerStories from "~stories/drawer/drawer.stories";

const { Resizable } = composeStories(drawerStories);

afterEach(() => page.viewport(1280, 1024));

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
  await expect.poll(() => drawer().getAnimations().length).toBe(0);
}

function handleCenter() {
  const rect = separator().element().getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

async function tabToSeparator() {
  await expect
    .element(page.getByRole("button", { name: "Close drawer" }))
    .toHaveFocus();
  await userEvent.tab({ shift: true });
  await expect.element(separator()).toHaveFocus();
}

const limitsStyle = (position: Position) =>
  isHorizontal(position)
    ? { width: 300, minWidth: 100, maxWidth: 600 }
    : { height: 300, minHeight: 100, maxHeight: 600 };

async function openDrawer() {
  await page.getByRole("button", { name: "Open Drawer" }).click();
  await waitForOpen();
}

async function renderResizable({
  position = "left",
  ...props
}: Partial<DrawerProps> = {}) {
  const result = await renderWithSalt(
    <Resizable position={position} style={limitsStyle(position)} {...props} />,
  );
  await openDrawer();
  return result;
}

describe("GIVEN a resizable Drawer", () => {
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
      await renderResizable();

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
      await renderWithSalt(
        <Drawer open resizable style={{ width: 300 }}>
          <DrawerHeader header="Resizable drawer" />
          <DrawerContent>Content</DrawerContent>
        </Drawer>,
      );
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
      await renderResizable();

      await tabToSeparator();

      await userEvent.tab();
      await expect
        .element(page.getByRole("button", { name: "Close drawer" }))
        .toHaveFocus();
    });

    it("shows a focus indicator when focused with the keyboard", async () => {
      await renderResizable();

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
      await renderResizable();

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
          const { container } = await renderResizable({ position });

          await runAxeScan(container);
        },
        AXE_TIMEOUT,
      );
    }

    it(
      "has no violations while resizing",
      async () => {
        const { container } = await renderResizable();

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
        const { container } = await renderResizable();

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
