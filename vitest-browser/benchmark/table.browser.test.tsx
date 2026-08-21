import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as tableStories from "~stories/table/table.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(tableStories);
const {
  Primary,
  ColumnHeaders,
  ScrollableVertically,
  ScrollableAriaLabelTable,
  ScrollableExternalLabelTable,
  ScrollableIdOverride,
  ScrollableAriaLabelledByOverride,
  ScrollableContainerAriaLabelOverride,
} = composedStories;

async function expectFocusableRegion(name: string) {
  await expect.element(page.getByRole("table", { name })).toBeVisible();
  const region = page.getByRole("region", { name });
  await expect.element(region).toBeVisible();
  await expect.element(region).toHaveAttribute("tabindex", "0");
  await userEvent.tab();
  await expect.element(region).toHaveFocus();
}

describe("GIVEN a Table", () => {
  checkAccessibility(composedStories);
});

describe("GIVEN a Table inside a TableContainer", () => {
  it("is a named focusable region when vertically scrollable", async () => {
    await renderWithSalt(<ScrollableVertically />);
    await expectFocusableRegion("Scrollable vertically");
  });

  it("uses its caption as the scrollable region name", async () => {
    await renderWithSalt(<Primary />);
    await expectFocusableRegion("Sample data table");
  });

  it("uses aria-label as the scrollable region name", async () => {
    await renderWithSalt(<ScrollableAriaLabelTable />);
    await expectFocusableRegion("Aria Label Table");
  });

  it("uses aria-labelledby as the scrollable region name", async () => {
    await renderWithSalt(<ScrollableExternalLabelTable />);
    await expectFocusableRegion("External Table Name");
  });

  it("is not a region or focusable when it does not scroll", async () => {
    await renderWithSalt(<ColumnHeaders />);
    await expect
      .element(page.getByRole("table", { name: "Column headers" }))
      .toBeVisible();
    expect(page.getByRole("region").elements()).toHaveLength(0);
    const container = page.getByTestId("non-scrollable-container");
    await expect.element(container).toBeVisible();
    await expect.element(container).not.toHaveAttribute("tabindex");
    await expect.element(container).not.toHaveAttribute("role");
    await expect.element(container).not.toHaveAttribute("aria-labelledby");
    await expect.element(container).not.toHaveAttribute("aria-label");
    await userEvent.tab();
    await expect.element(container).not.toHaveFocus();
  });

  it("prioritizes a user-provided table id", async () => {
    await renderWithSalt(<ScrollableIdOverride />);
    await expect
      .element(page.getByRole("table", { name: "Caption Name" }))
      .toHaveAttribute("id", "user-provided-id");
    const region = page.getByRole("region", { name: "Caption Name" });
    await expect.element(region).toBeVisible();
    await userEvent.tab();
    await expect.element(region).toHaveFocus();
  });

  it("prioritizes user-provided aria-labelledby on the container", async () => {
    await renderWithSalt(<ScrollableAriaLabelledByOverride />);
    await expect
      .element(page.getByRole("table", { name: "External Table Name" }))
      .toBeVisible();
    const region = page.getByRole("region", {
      name: "External Table Container Name",
    });
    await expect
      .element(region)
      .toHaveAttribute("aria-labelledby", "user-provided-aria-labelledby");
    await userEvent.tab();
    await expect.element(region).toHaveFocus();
  });

  it("prioritizes user-provided aria-label on the container", async () => {
    await renderWithSalt(<ScrollableContainerAriaLabelOverride />);
    await expect
      .element(page.getByRole("table", { name: "Caption Name" }))
      .toBeVisible();
    const region = page.getByRole("region", {
      name: "User Provided Aria Label",
    });
    await expect
      .element(region)
      .toHaveAttribute("aria-label", "User Provided Aria Label");
    await userEvent.tab();
    await expect.element(region).toHaveFocus();
  });
});
