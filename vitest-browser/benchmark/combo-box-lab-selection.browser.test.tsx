import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as comboBoxStories from "~stories/combobox/combobox.stories";
import { renderWithSalt } from "../render";

const { Default } = composeStories(comboBoxStories);

const comboBox = () => page.getByRole("combobox");
const option = (name?: string) =>
  name
    ? page.getByRole("option", { name, exact: true })
    : page.getByRole("option");

async function select(name: string) {
  const item = option(name);
  await item.hover();
  await item.click();
}

describe("A lab combo box selection", () => {
  it("selects the clicked item", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(<Default onSelectionChange={onSelectionChange} />);
    await comboBox().click();
    await select("Alaska");

    await expect.element(comboBox()).toHaveValue("Alaska");
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    expect(onSelectionChange).toHaveBeenCalledWith(expect.anything(), "Alaska");
  });

  it("updates the input with each selected item", async () => {
    await renderWithSalt(<Default />);
    await comboBox().click();
    await userEvent.keyboard("ama");
    await expect.element(comboBox()).toHaveValue("ama");
    await select("Alabama");
    await expect.element(comboBox()).toHaveValue("Alabama");

    await comboBox().click();
    await comboBox().clear();
    await userEvent.keyboard("Conn");
    await expect.element(comboBox()).toHaveValue("Conn");
    await select("Connecticut");
    await expect.element(comboBox()).toHaveValue("Connecticut");
  });

  it("does nothing when the selected item is clicked again", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <>
        <Default onSelectionChange={onSelectionChange} />
        <button type="button">After ComboBox</button>
      </>,
    );
    await comboBox().click();
    await select("Alaska");

    await userEvent.tab();
    await comboBox().click();
    await select("Alaska");
    await expect.element(comboBox()).toHaveValue("Alaska");

    await userEvent.tab();
    await comboBox().click();
    const alaska = option("Alaska");
    await expect.element(alaska).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => alaska.element().className)
      .toMatch(/saltHighlighted/);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("does not clear selection when input value changes", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(<Default onSelectionChange={onSelectionChange} />);
    await comboBox().click();
    await select("Alaska");

    await comboBox().click();
    await userEvent.keyboard("{Backspace}");
    await expect
      .element(option("Alaska"))
      .toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("clears selection when input is cleared", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(<Default onSelectionChange={onSelectionChange} />);
    await comboBox().click();
    await select("Alaska");

    await comboBox().click();
    await comboBox().clear();
    await expect
      .element(option("Alaska"))
      .not.toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.anything(), null);
  });
});
