import { NavigationItem } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";

describe("GIVEN a NavItem", () => {
  it("renders a link when href is provided", async () => {
    await renderWithSalt(
      <NavigationItem href="https://www.saltdesignsystem.com">
        Navigation Item
      </NavigationItem>,
    );
    await expect
      .element(page.getByRole("link"))
      .toHaveAttribute("href", "https://www.saltdesignsystem.com");
  });

  it("renders a button without href", async () => {
    await renderWithSalt(<NavigationItem>Navigation Item</NavigationItem>);
    await expect.element(page.getByRole("button")).toBeInTheDocument();
  });

  it("calls onClick", async () => {
    const onClick = vi.fn();
    await renderWithSalt(
      <NavigationItem onClick={onClick}>Navigation Item</NavigationItem>,
    );
    await page.getByRole("button").click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each([
    [true, "page"],
    [false, null],
  ] as const)("sets aria-current when active=%s", async (active, current) => {
    await renderWithSalt(
      <NavigationItem href="#" active={active}>
        Navigation Item
      </NavigationItem>,
    );
    const link = page.getByRole("link");
    if (current)
      await expect.element(link).toHaveAttribute("aria-current", current);
    else await expect.element(link).not.toHaveAttribute("aria-current");
  });

  it("renders children as its label", async () => {
    await renderWithSalt(<NavigationItem>Navigation Item</NavigationItem>);
    await expect.element(page.getByText("Navigation Item")).toBeInTheDocument();
  });

  it("renders an icon", async () => {
    await renderWithSalt(
      <NavigationItem>
        <NotificationIcon />
        Navigation Item
      </NavigationItem>,
    );
    await expect
      .element(page.getByTestId("NotificationIcon"))
      .toBeInTheDocument();
  });

  it("renders a collapsed expansion button", async () => {
    await renderWithSalt(
      <NavigationItem parent>Navigation Item</NavigationItem>,
    );
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-expanded", "false");
  });

  it("calls onExpand", async () => {
    const onExpand = vi.fn();
    await renderWithSalt(
      <NavigationItem parent onExpand={onExpand}>
        Navigation Item
      </NavigationItem>,
    );
    await page.getByRole("button").click();
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it("renders an expanded button", async () => {
    await renderWithSalt(
      <NavigationItem parent expanded>
        Navigation Item
      </NavigationItem>,
    );
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-expanded", "true");
  });

  it("calls a render function for a parent item", async () => {
    const render = vi
      .fn()
      .mockReturnValue(<button type="button">Parent Button</button>);
    await renderWithSalt(
      <NavigationItem
        active
        expanded
        level={2}
        parent
        orientation="vertical"
        render={render}
      >
        Navigation Item
      </NavigationItem>,
    );
    await expect.element(page.getByText("Parent Button")).toBeInTheDocument();
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        "aria-expanded": true,
        className: expect.any(String),
        children: expect.anything(),
      }),
    );
  });

  it("calls a render function for a child item", async () => {
    // biome-ignore lint/a11y/useValidAnchor: Anchor is only used for testing.
    const render = vi.fn().mockReturnValue(<a>Navigation Link</a>);
    await renderWithSalt(
      <NavigationItem
        active
        expanded
        href="https://www.saltdesignsystem.com"
        level={2}
        orientation="vertical"
        render={render}
      >
        Navigation Item
      </NavigationItem>,
    );
    await expect.element(page.getByText("Navigation Link")).toBeInTheDocument();
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        "aria-current": "page",
        className: expect.any(String),
        children: expect.anything(),
        href: "https://www.saltdesignsystem.com",
      }),
    );
  });

  it("merges props into a rendered JSX element", async () => {
    await renderWithSalt(
      <NavigationItem
        parent
        render={<button type="button">Button Children</button>}
      >
        Navigation Item
      </NavigationItem>,
    );
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(page.getByText("Button Children")).toBeInTheDocument();
  });
});
