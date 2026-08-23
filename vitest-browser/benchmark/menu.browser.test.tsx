import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as menuStories from "~stories/menu/menu.stories";
import {
  CustomFloatingComponentProvider,
  FLOATING_TEST_ID,
} from "../../packages/core/src/__tests__/__e2e__/common";
import { renderWithSalt } from "../render";

const {
  ContextMenu,
  SingleLevel,
  MultiLevel,
  GroupedItems,
  IconWithGroups,
  WithTooltip,
  WithDisabledItems,
} = composeStories(menuStories);

afterEach(() => vi.restoreAllMocks());

const trigger = () => page.getByRole("button", { name: "Open Menu" });
const menuCount = async () => (await page.getByRole("menu").elements()).length;
const backgroundTarget = () => page.getByTestId("menu-background-target");

function rectanglesOverlap(a: DOMRect, b: DOMRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function MultiLevelWithBackgroundTarget() {
  return (
    <>
      <MultiLevel />
      <div
        aria-hidden="true"
        data-testid="menu-background-target"
        style={{
          background: "transparent",
          bottom: 8,
          height: 32,
          pointerEvents: "auto",
          position: "fixed",
          right: 8,
          width: 32,
        }}
      />
    </>
  );
}

describe("Given a Menu", () => {
  it("opens, performs an action, and closes with a mouse", async () => {
    const onOpenChange = vi.fn();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    await renderWithSalt(<SingleLevel onOpenChange={onOpenChange} />);
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    await trigger().click();
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
    const menuPanel = document.querySelector(".saltMenuPanel");
    if (!menuPanel) throw new Error("Menu panel missing");
    expect(getComputedStyle(menuPanel)).toHaveProperty("zIndex", "1500");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await page.getByRole("menuitem", { name: "Copy" }).click();
    expect(alertSpy).toHaveBeenCalledWith("Copy");
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each(["{Enter}", " "])(
    "opens and selects the focused item with %s",
    async (selectionKey) => {
      const onOpenChange = vi.fn();
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      await renderWithSalt(<SingleLevel onOpenChange={onOpenChange} />);
      trigger().element().focus();
      await userEvent.keyboard("{Enter}");
      await expect
        .element(page.getByRole("menuitem", { name: "Copy" }))
        .toHaveFocus();
      await userEvent.keyboard(selectionKey);
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
      expect(alertSpy).toHaveBeenCalledWith("Copy");
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    },
  );

  it("closes on Escape", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(<SingleLevel onOpenChange={onOpenChange} />);
    trigger().element().focus();
    await userEvent.keyboard("{Enter}{Escape}");
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports non-wrapping keyboard navigation", async () => {
    await renderWithSalt(<SingleLevel />);
    await trigger().click();
    await expect.element(page.getByRole("menu")).toHaveFocus();
    for (const [key, name] of [
      ["{ArrowDown}", "Copy"],
      ["{ArrowDown}", "Paste"],
      ["{ArrowUp}", "Copy"],
      ["{End}", "Settings"],
      ["{ArrowDown}", "Settings"],
      ["{Home}", "Copy"],
      ["{ArrowUp}", "Copy"],
    ] as const) {
      await userEvent.keyboard(key);
      await expect.element(page.getByRole("menuitem", { name })).toHaveFocus();
    }
  });

  it("supports nested menus and actions", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    await renderWithSalt(<MultiLevel />);
    await trigger().click();
    const nestedTrigger = page.getByRole("menuitem", {
      name: "Edit styling",
    });
    await expect
      .element(nestedTrigger)
      .toHaveAttribute("aria-expanded", "false");
    await nestedTrigger.hover();
    await expect
      .element(nestedTrigger)
      .toHaveAttribute("aria-expanded", "true");
    for (const name of ["Column", "Cell", "Row"])
      await expect
        .element(page.getByRole("menuitem", { name }))
        .toBeInTheDocument();
    const column = page.getByRole("menuitem", { name: "Column" });
    await column.hover();
    await expect.element(nestedTrigger).toHaveClass("saltMenuItem-blurActive");
    await column.click();
    expect(alertSpy).toHaveBeenCalledWith("Column");
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  });

  it("closes a nested menu when hovering another parent item", async () => {
    await renderWithSalt(<MultiLevel />);
    await trigger().click();
    expect(await menuCount()).toBe(1);
    await page.getByRole("menuitem", { name: "Edit styling" }).hover();
    await expect.poll(menuCount).toBe(2);
    await page.getByRole("menuitem", { name: "Copy" }).hover();
    await expect.poll(menuCount).toBe(1);
  });

  it("closes a nested menu when the pointer moves to page background", async () => {
    await renderWithSalt(<MultiLevelWithBackgroundTarget />);
    await trigger().click();
    await page.getByRole("menuitem", { name: "Edit styling" }).hover();
    await expect.element(page.getByRole("menu")).toHaveLength(2);

    const targetRect = backgroundTarget().element().getBoundingClientRect();
    const surfaces = [trigger().element(), ...page.getByRole("menu").elements()];
    expect(targetRect.width).toBeGreaterThan(0);
    expect(targetRect.height).toBeGreaterThan(0);
    for (const surface of surfaces) {
      expect(
        rectanglesOverlap(targetRect, surface.getBoundingClientRect()),
      ).toBe(false);
    }

    await backgroundTarget().hover();
    await expect.element(page.getByRole("menu")).toHaveLength(1);
  });

  it("supports nested keyboard navigation", async () => {
    await renderWithSalt(<MultiLevel />);
    trigger().element().focus();
    await userEvent.keyboard("{Enter}");
    const nestedTrigger = page.getByRole("menuitem", {
      name: "Edit styling",
    });
    nestedTrigger.element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("menuitem", { name: "Column" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(page.getByRole("menuitem", { name: "Cell" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(nestedTrigger).toHaveFocus();
  });

  it("supports groups", async () => {
    await renderWithSalt(<GroupedItems open />);
    for (const name of ["Actions", "Styling", "Configurations"])
      await expect
        .element(page.getByRole("group", { name }))
        .toBeInTheDocument();
  });

  it("ignores disabled items", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    await renderWithSalt(<IconWithGroups />);
    await trigger().click();
    const paste = page.getByRole("menuitem", { name: "Paste" });
    await expect.element(paste).toHaveAttribute("aria-disabled");
    await paste.click({ force: true });
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
    await expect.element(paste).not.toHaveFocus();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("does not open disabled nested items on hover", async () => {
    await renderWithSalt(<WithDisabledItems />);
    await trigger().click();
    for (const name of ["Edit styling", "Export"])
      await expect
        .element(page.getByRole("menuitem", { name }))
        .toHaveAttribute("aria-disabled", "true");
    await page.getByRole("menuitem", { name: "Edit styling" }).hover();
    await expect
      .element(page.getByRole("menuitem", { name: "Column" }))
      .not.toBeInTheDocument();
  });

  it("focuses items on hover", async () => {
    await renderWithSalt(<SingleLevel open />);
    const paste = page.getByRole("menuitem", { name: "Paste" });
    await paste.hover();
    await expect.element(paste).toHaveFocus();
  });

  it("supports uncontrolled open", async () => {
    await renderWithSalt(<SingleLevel defaultOpen />);
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
    await trigger().click();
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  });

  it("supports controlled open", async () => {
    await renderWithSalt(<SingleLevel open />);
    await trigger().click();
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
  });

  it("supports a virtual context-menu trigger", async () => {
    await renderWithSalt(<ContextMenu />);
    const target = page.getByText("Right click here");
    const rect = target.element().getBoundingClientRect();
    await target.click({ button: "right" });
    const menu = page.getByRole("menu");
    await expect.element(menu).toBeInTheDocument();
    await expect
      .poll(() => getComputedStyle(menu.element()).top)
      .toBe(`${rect.top + rect.height / 2}px`);
    await expect
      .poll(() => getComputedStyle(menu.element()).left)
      .toBe(`${rect.left + rect.width / 2}px`);
  });

  it("renders a configured floating component", async () => {
    await renderWithSalt(
      <CustomFloatingComponentProvider>
        <SingleLevel open />
      </CustomFloatingComponentProvider>,
    );
    await expect
      .element(page.getByTestId(FLOATING_TEST_ID))
      .toBeInTheDocument();
  });

  it("supports tooltip on its trigger", async () => {
    await renderWithSalt(
      <>
        <WithTooltip />
        <button type="button">After menu trigger</button>
      </>,
    );
    await userEvent.tab();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After menu trigger" }))
      .toHaveFocus();
    await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
    const menuTrigger = page.getByRole("button", { name: "Open Menu" });
    await menuTrigger.hover();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await menuTrigger.click();
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
  });
});
