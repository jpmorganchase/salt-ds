import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as verticalNavigationStories from "~stories/vertical-navigation/vertical-navigation.stories";

const { Basic, CollapsibleSubmenu, WithExpandButton } = composeStories(
  verticalNavigationStories,
);

describe("GIVEN a VerticalNavigation", () => {
  it("renders a list of links", async () => {
    await renderWithSalt(<Basic />);
    await expect.element(page.getByRole("link")).toHaveLength(5);
  });

  it("supports mouse navigation", async () => {
    await renderWithSalt(<Basic />);
    const home = page.getByRole("link", { name: "Home" });
    await home.click();
    await expect.element(home).toHaveAttribute("aria-current", "page");
  });

  it("supports keyboard navigation", async () => {
    await renderWithSalt(<Basic />);
    const home = page.getByRole("link", { name: "Home" });
    await userEvent.tab();
    await expect.element(home).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(home).toHaveAttribute("aria-current", "page");
  });

  it("supports nested collapsible items", async () => {
    await renderWithSalt(<CollapsibleSubmenu />);
    const products = page.getByRole("button", { name: "Products" });
    await expect.element(products).toHaveAttribute("aria-expanded", "false");
    await products.click();
    await expect.element(products).toHaveAttribute("aria-expanded", "true");
    await expect
      .element(page.getByRole("link", { name: "Widgets" }))
      .toBeVisible();
    await userEvent.tab();
    await expect
      .element(page.getByRole("link", { name: "Widgets" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("link", { name: "Gadgets" }))
      .toHaveFocus();
  });

  it("supports separate expand and navigate actions", async () => {
    await renderWithSalt(<WithExpandButton />);
    const solutions = page.getByRole("link", { name: "Solutions" });
    const expand = page.getByRole("button", { name: "Solutions Subpages" });
    await expect.element(solutions).not.toHaveAttribute("aria-expanded");
    await expect.element(expand).toHaveAttribute("aria-expanded", "false");

    await solutions.click();
    await expect.element(solutions).toHaveAttribute("aria-current", "page");
    await expect.element(expand).toHaveAttribute("aria-expanded", "false");

    await expand.click();
    await expect.element(expand).toHaveAttribute("aria-expanded", "true");
    await expect
      .element(page.getByRole("link", { name: "By Industry" }))
      .toBeVisible();
    await userEvent.tab();
    await expect
      .element(page.getByRole("link", { name: "By Industry" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "By Industry Subpages" }))
      .toHaveFocus();
  });
});
