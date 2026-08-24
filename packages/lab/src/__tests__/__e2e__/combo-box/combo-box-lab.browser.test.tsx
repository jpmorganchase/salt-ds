import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as comboBoxStories from "~stories/combobox/combobox.stories";

const {
  Default,
  WithInitialSelection,
  ItemRenderer,
  WithCustomizedFilter,
  Controlled,
} = composeStories(comboBoxStories);

const comboBox = () => page.getByRole("combobox");

async function expectOptionCount(count: number) {
  await expect
    .poll(async () => (await page.getByRole("option").elements()).length)
    .toBe(count);
}

describe("A lab combo box", () => {
  it("renders all its items", async () => {
    await renderWithSalt(<Default />);
    await userEvent.tab();

    if (!Default.args.source)
      throw new Error("Invalid test: source is missing");
    for (const item of Default.args.source) {
      await expect
        .element(page.getByRole("option", { name: item, exact: true }))
        .toBeVisible();
    }
  });

  it("renders with a customized id", async () => {
    await renderWithSalt(<Default id="my-combo-box" />);
    await comboBox().click();

    await expect
      .element(comboBox())
      .toHaveAttribute("id", "my-combo-box-input");
    await expect
      .element(page.getByRole("listbox"))
      .toHaveAttribute("id", "my-combo-box-list");
    for (const [index, option] of (
      await page.getByRole("option").elements()
    ).entries()) {
      expect(option).toHaveAttribute("id", `my-combo-box-item-${index}`);
    }
  });

  it("renders with a customized itemToString", async () => {
    await renderWithSalt(<ItemRenderer />);
    await comboBox().click();

    for (const city of ["Tokyo", "Delhi", "Shanghai"]) {
      await expect.element(page.getByText(city)).toBeVisible();
    }
  });

  it("allows setting initialSelectedItem", async () => {
    await renderWithSalt(<WithInitialSelection />);
    await comboBox().click();

    await expect.element(comboBox()).toHaveValue("Brown");
    await expectOptionCount(1);
    await expect
      .element(page.getByRole("option"))
      .toHaveAttribute("aria-selected", "true");
  });

  it("allows a customized item filter", async () => {
    await renderWithSalt(<WithCustomizedFilter />);
    await comboBox().click();
    await userEvent.keyboard("as");

    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    await expectOptionCount(0);
  });

  it("filters and clears items and reports input changes", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Default onChange={onChange} />);
    await comboBox().click();
    await userEvent.keyboard("ska");
    await expectOptionCount(2);

    await comboBox().clear();
    if (!Default.args.source)
      throw new Error("Invalid test: source is missing");
    await expectOptionCount(Default.args.source.length);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), "ska");
  });

  it("highlights matching text", async () => {
    await renderWithSalt(<Default />);
    await comboBox().click();
    await userEvent.keyboard("Connec");

    await expectOptionCount(1);
    await expect
      .element(page.getByText("Connec"))
      .toHaveClass("saltHighlighter-highlight");
  });

  it("works when controlled", async () => {
    await renderWithSalt(<Controlled />);
    await userEvent.tab();
    await userEvent.keyboard("Baby bl{Enter}");

    await expect.element(comboBox()).toHaveValue("Baby blue");
  });
});
