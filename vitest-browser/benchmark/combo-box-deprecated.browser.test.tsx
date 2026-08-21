import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as comboBoxStories from "~stories/combobox/combobox-deprecated.stories";
import { pasteValue } from "../interactions";
import { renderWithSalt } from "../render";

const {
  Default,
  MultiSelectWithInitialSelection,
  WithInitialSelection,
  MultiSelect,
  ItemRenderer,
  WithCustomizedFilter,
} = composeStories(comboBoxStories);

async function expectOptionCount(count: number) {
  await expect
    .poll(async () => (await page.getByRole("option").elements()).length)
    .toBe(count);
}

describe("A deprecated combo box", () => {
  it("renders all its items", async () => {
    await renderWithSalt(<Default />);
    await userEvent.tab();

    if (!Default.args.source) {
      throw new Error("Invalid test. source is not defined");
    }
    for (const item of Default.args.source) {
      await expect
        .element(page.getByRole("option", { name: item, exact: true }))
        .toBeVisible();
    }
  });

  it("renders with a customized id", async () => {
    await renderWithSalt(<Default id="my-combo-box" />);
    const comboBox = page.getByRole("combobox");
    await comboBox.click();

    await expect.element(comboBox).toHaveAttribute("id", "my-combo-box-input");
    await expect
      .element(page.getByRole("listbox"))
      .toHaveAttribute("id", "my-combo-box-list");
    for (const [index, item] of (
      await page.getByRole("option").elements()
    ).entries()) {
      expect(item).toHaveAttribute("id", `my-combo-box-list-item-${index}`);
    }
  });

  it("renders with a customized itemToString", async () => {
    await renderWithSalt(<ItemRenderer />);
    await page.getByRole("combobox").click();

    await expect.element(page.getByText("Tokyo")).toBeVisible();
    await expect.element(page.getByText("Delhi")).toBeVisible();
    await expect.element(page.getByText("Shanghai")).toBeVisible();
  });

  it("allows setting initialSelectedItem", async () => {
    await renderWithSalt(<WithInitialSelection />);
    await page.getByRole("combobox").click();

    await expect.element(page.getByRole("combobox")).toHaveValue("Brown");
    await expectOptionCount(1);
    await expect
      .element(page.getByRole("option"))
      .toHaveClass("saltListItemDeprecated-selected");
  });

  it("becomes multi-select when initialSelectedItem is an array", async () => {
    if (!Default.args.source) {
      throw new Error("Invalid test. source is not defined");
    }

    await renderWithSalt(
      <Default
        initialSelectedItem={[Default.args.source[0], Default.args.source[1]]}
      />,
    );
    await page.getByRole("textbox").click();

    await expect.element(page.getByRole("textbox")).toHaveValue("");
    const pills = page.getByTestId("pill");
    await expect.poll(async () => (await pills.elements()).length).toBe(2);
    await expect
      .element(pills.nth(0))
      .toHaveTextContent(Default.args.source[0]);
    await expect
      .element(pills.nth(1))
      .toHaveTextContent(Default.args.source[1]);
    await expect
      .element(
        page.getByRole("option", {
          name: Default.args.source[0],
          exact: true,
        }),
      )
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(
        page.getByRole("option", {
          name: Default.args.source[1],
          exact: true,
        }),
      )
      .toHaveAttribute("aria-selected", "true");
  });

  it("allows a customized item filter", async () => {
    await renderWithSalt(<WithCustomizedFilter />);
    await page.getByRole("combobox").click();
    await userEvent.keyboard("as");

    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    await expectOptionCount(0);
  });

  it("filters and clears items", async () => {
    await renderWithSalt(<Default />);
    const comboBox = page.getByRole("combobox");
    await comboBox.click();
    await userEvent.keyboard("ska");
    await expectOptionCount(2);

    await comboBox.clear();
    if (!Default.args.source) {
      throw new Error("Invalid test. source is not defined");
    }
    await expectOptionCount(Default.args.source.length);
  });

  it("highlights matching text", async () => {
    await renderWithSalt(<Default />);
    await page.getByRole("combobox").click();
    await userEvent.keyboard("Connec");

    await expectOptionCount(1);
    await expect
      .element(page.getByText("Connec"))
      .toHaveClass("saltHighlighter-highlight");
  });
});

describe("A deprecated multi-select combo box", () => {
  it.skip("renders with a customized id", async () => {
    await renderWithSalt(<MultiSelectWithInitialSelection id="my-combo-box" />);

    await page.getByRole("textbox").click();
    await expect
      .element(page.getByRole("textbox"))
      .toHaveAttribute("id", "my-combo-box-input-input");
    await expect
      .element(page.getByRole("listbox"))
      .toHaveAttribute("id", "my-combo-box-list");

    for (const [index, pill] of (
      await page.getByTestId("pill").elements()
    ).entries()) {
      expect(pill).toHaveAttribute("id", `my-combo-box-input-pill-${index}`);
    }
    for (const [index, option] of (
      await page.getByRole("option").elements()
    ).entries()) {
      expect(option).toHaveAttribute("id", `my-combo-box-list-item-${index}`);
    }
  });

  it("supports the Cypress paste helper semantics", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<MultiSelect delimiter="|" onChange={onChange} />);
    const textbox = page.getByRole("textbox");
    await textbox.click();
    pasteValue(textbox, "Alabama| Alaska");

    const pills = page.getByTestId("pill");
    await expect.poll(async () => (await pills.elements()).length).toBe(2);
    await expect.element(pills.nth(0)).toHaveTextContent("Alabama");
    await expect.element(pills.nth(1)).toHaveTextContent("Alaska");
    await expect
      .element(page.getByRole("option", { name: "Alabama", exact: true }))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(page.getByRole("option", { name: "Alaska", exact: true }))
      .toHaveAttribute("aria-selected", "true");
    expect(onChange).toHaveBeenCalledWith(null, ["Alabama", "Alaska"]);
  });
});
