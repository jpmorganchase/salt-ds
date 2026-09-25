import {
  Button,
  Menu,
  MenuGroup,
  type MenuGroupProps,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as menuStories from "~stories/menu/menu.stories";
import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const {
  ContextMenu,
  SingleLevel,
  MultiLevel,
  GroupedItems,
  IconWithGroups,
  WithTooltip,
  WithDisabledItems,
  SingleSelection,
  MultipleSelection,
  MixedSelection,
  SelectionInSubmenu,
} = composeStories(menuStories);

afterEach(() => vi.restoreAllMocks());

const trigger = () => page.getByRole("button", { name: "Open Menu" });
const menuCount = async () => (await page.getByRole("menu").elements()).length;
const backgroundTarget = () => page.getByTestId("menu-background-target");

function rectanglesOverlap(a: DOMRect, b: DOMRect) {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
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
    await page.getByRole("menuitem", { name: "Copy" }).hover({ force: true });
    await expect.poll(menuCount).toBe(1);
  });

  it("closes a nested menu when the pointer moves to page background", async () => {
    await renderWithSalt(<MultiLevelWithBackgroundTarget />);
    await trigger().click();
    await page.getByRole("menuitem", { name: "Edit styling" }).hover();
    await expect.element(page.getByRole("menu")).toHaveLength(2);

    const targetRect = backgroundTarget().element().getBoundingClientRect();
    const surfaces = [
      trigger().element(),
      ...page.getByRole("menu").elements(),
    ];
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

function SelectableMenu({
  children,
  defaultSelected = [],
  onSelectionChange,
  ...rest
}: MenuGroupProps & { children?: ReactNode; defaultSelected?: string[] }) {
  const [selected, setSelected] = useState(defaultSelected);

  return (
    <Menu>
      <MenuTrigger>
        <Button aria-label="Open Menu">Open Menu</Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup
          label="Options"
          selected={selected}
          onSelectionChange={(event, newSelected) => {
            setSelected(newSelected);
            onSelectionChange?.(event, newSelected);
          }}
          {...rest}
        >
          {children ?? (
            <>
              <MenuItem value="one">One</MenuItem>
              <MenuItem value="two">Two</MenuItem>
              <MenuItem disabled value="three">
                Three
              </MenuItem>
            </>
          )}
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
}

const itemRole = {
  single: "menuitemradio",
  multiple: "menuitemcheckbox",
} as const;

describe("Given a Menu with selectable groups", () => {
  it("renders radio and checkbox menu items", async () => {
    await renderWithSalt(<MixedSelection open />);
    await expect
      .element(page.getByRole("group", { name: "Sort by" }))
      .toBeInTheDocument();
    const name = page.getByRole("menuitemradio", { name: "Name" });
    await expect.element(name).toHaveAttribute("aria-checked", "true");
    expect(
      name.element().querySelector(".saltRadioButtonIcon-checked"),
    ).not.toBeNull();
    await expect
      .element(page.getByRole("menuitemradio", { name: "Date modified" }))
      .toHaveAttribute("aria-checked", "false");
    const owner = page.getByRole("menuitemcheckbox", { name: "Owner" });
    await expect.element(owner).toHaveAttribute("aria-checked", "true");
    expect(
      owner.element().querySelector(".saltCheckboxIcon-checked"),
    ).not.toBeNull();
    const exportItem = page.getByRole("menuitem", { name: "Export" });
    await expect.element(exportItem).not.toHaveAttribute("aria-checked");
    expect(exportItem.element().querySelector(".saltCheckboxIcon")).toBeNull();
  });

  it("selects one item and closes the menu on click in single selection", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(<SingleSelection onOpenChange={onOpenChange} />);
    await trigger().click();
    await page.getByRole("menuitemradio", { name: "Size" }).click();
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await trigger().click();
    await expect
      .element(page.getByRole("menuitemradio", { name: "Size" }))
      .toHaveAttribute("aria-checked", "true");
    await expect
      .element(page.getByRole("menuitemradio", { name: "Name" }))
      .toHaveAttribute("aria-checked", "false");
  });

  it("toggles items and keeps the menu open on click in multiple selection", async () => {
    await renderWithSalt(<MultipleSelection />);
    await trigger().click();
    const owner = page.getByRole("menuitemcheckbox", { name: "Owner" });
    const modified = page.getByRole("menuitemcheckbox", {
      name: "Date modified",
    });
    await owner.click();
    await modified.click();
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
    await expect.element(owner).toHaveAttribute("aria-checked", "false");
    await expect.element(modified).toHaveAttribute("aria-checked", "true");
  });

  it("calls onSelectionChange with the new selection", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <SelectableMenu
        selectionVariant="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );
    await trigger().click();
    const one = page.getByRole("menuitemcheckbox", { name: "One" });
    const two = page.getByRole("menuitemcheckbox", { name: "Two" });
    await one.click();
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.anything(), [
      "one",
    ]);
    await two.click();
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.anything(), [
      "one",
      "two",
    ]);
    await one.click();
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.anything(), [
      "two",
    ]);
  });

  it("does not call onSelectionChange when the checked radio item is selected again", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <SelectableMenu
        selectionVariant="single"
        defaultSelected={["one"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    await trigger().click();
    await page.getByRole("menuitemradio", { name: "One" }).click();
    expect(onSelectionChange).not.toHaveBeenCalled();
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  });

  it.each(["single", "multiple"] as const)(
    "selects and closes the menu with Enter in %s selection",
    async (selectionVariant) => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <SelectableMenu
          selectionVariant={selectionVariant}
          onSelectionChange={onSelectionChange}
        />,
      );
      trigger().element().focus();
      await userEvent.keyboard("{Enter}");
      await expect
        .element(page.getByRole(itemRole[selectionVariant], { name: "One" }))
        .toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
      expect(onSelectionChange).toHaveBeenLastCalledWith(expect.anything(), [
        "one",
      ]);
    },
  );

  it.each(["single", "multiple"] as const)(
    "selects and keeps the menu open with Space in %s selection",
    async (selectionVariant) => {
      await renderWithSalt(
        <SelectableMenu selectionVariant={selectionVariant} />,
      );
      trigger().element().focus();
      await userEvent.keyboard("{Enter}");
      const one = page.getByRole(itemRole[selectionVariant], { name: "One" });
      await expect.element(one).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect.element(one).toHaveAttribute("aria-checked", "true");
      await expect.element(page.getByRole("menu")).toBeInTheDocument();
      await expect.element(one).toHaveFocus();
    },
  );

  it("keeps the menu open on click and Enter when closeOnSelect is false", async () => {
    await renderWithSalt(
      <SelectableMenu selectionVariant="single" closeOnSelect={false} />,
    );
    await trigger().click();
    const one = page.getByRole("menuitemradio", { name: "One" });
    await one.click();
    await expect.element(one).toHaveAttribute("aria-checked", "true");
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
    const two = page.getByRole("menuitemradio", { name: "Two" });
    two.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect.element(two).toHaveAttribute("aria-checked", "true");
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
  });

  it("closes the menu on click and Space when closeOnSelect is true", async () => {
    await renderWithSalt(
      <SelectableMenu selectionVariant="multiple" closeOnSelect />,
    );
    await trigger().click();
    await page.getByRole("menuitemcheckbox", { name: "One" }).click();
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    trigger().element().focus();
    await userEvent.keyboard("{Enter}");
    const one = page.getByRole("menuitemcheckbox", { name: "One" });
    await expect.element(one).toHaveAttribute("aria-checked", "true");
    await expect.element(one).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  });

  it("does not select disabled items", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <SelectableMenu
        selectionVariant="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );
    await trigger().click();
    const three = page.getByRole("menuitemcheckbox", { name: "Three" });
    await expect.element(three).toHaveAttribute("aria-disabled", "true");
    await three.click({ force: true });
    await expect.element(three).toHaveAttribute("aria-checked", "false");
    await expect.element(page.getByRole("menu")).toBeInTheDocument();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("keeps submenu triggers and nested items as regular menu items", async () => {
    await renderWithSalt(
      <SelectableMenu selectionVariant="multiple">
        <MenuItem value="one">One</MenuItem>
        <Menu>
          <MenuTrigger>
            <MenuItem>More options</MenuItem>
          </MenuTrigger>
          <MenuPanel>
            <MenuItem>Nested</MenuItem>
          </MenuPanel>
        </Menu>
      </SelectableMenu>,
    );
    await trigger().click();
    const moreOptions = page.getByRole("menuitem", { name: "More options" });
    await expect.element(moreOptions).not.toHaveAttribute("aria-checked");
    await moreOptions.hover();
    await expect
      .element(page.getByRole("menuitem", { name: "Nested" }))
      .not.toHaveAttribute("aria-checked");
  });

  it("supports selection in a submenu", async () => {
    await renderWithSalt(<SelectionInSubmenu />);
    await trigger().click();
    await page.getByRole("menuitem", { name: "Sort by" }).hover();
    await page.getByRole("menuitemradio", { name: "Size" }).click();
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    await trigger().click();
    await page.getByRole("menuitem", { name: "Sort by" }).hover();
    await expect
      .element(page.getByRole("menuitemradio", { name: "Size" }))
      .toHaveAttribute("aria-checked", "true");
  });

  it("warns when a menu item in a selectable group has no value", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await renderWithSalt(
      <SelectableMenu selectionVariant="single" defaultSelected={[]}>
        <MenuItem value="one">One</MenuItem>
        <MenuItem>Reset</MenuItem>
      </SelectableMenu>,
    );
    await trigger().click();
    await expect
      .element(page.getByRole("menuitem", { name: "Reset" }))
      .not.toHaveAttribute("aria-checked");
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("MenuItem requires a `value`"),
    );
  });

  it("warns when a selectable group has no selected prop", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await renderWithSalt(
      <Menu open>
        <MenuTrigger>
          <Button aria-label="Open Menu">Open Menu</Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuGroup selectionVariant="multiple" aria-label="Options">
            <MenuItem value="one">One</MenuItem>
          </MenuGroup>
        </MenuPanel>
      </Menu>,
    );
    await expect
      .element(page.getByRole("menuitemcheckbox", { name: "One" }))
      .toHaveAttribute("aria-checked", "false");
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("MenuGroup requires `selected`"),
    );
  });
});
