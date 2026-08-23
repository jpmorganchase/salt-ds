import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as comboBoxStories from "~stories/combobox/combobox-deprecated.stories";
import { renderWithSalt } from "../render";

const { Default, MultiSelect } = composeStories(comboBoxStories);

const comboBox = () => page.getByRole("combobox");
const textbox = () => page.getByRole("textbox");
const option = (name?: string) =>
  name
    ? page.getByRole("option", { name, exact: true })
    : page.getByRole("option");

describe("A deprecated combo box selection", () => {
  it("selects the clicked item", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Default onChange={onChange} />);
    await comboBox().click();
    await option("Alaska").click();

    await expect.element(comboBox()).toHaveValue("Alaska");
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(expect.anything(), "Alaska");
  });

  it("updates the input with each selected item", async () => {
    await renderWithSalt(<Default />);
    await comboBox().click();
    await userEvent.keyboard("ama");
    await expect.element(comboBox()).toHaveValue("ama");
    await option().click();
    await expect.element(comboBox()).toHaveValue("Alabama");

    await comboBox().click();
    await comboBox().clear();
    await userEvent.keyboard("Conn");
    await expect.element(comboBox()).toHaveValue("Conn");
    await option().click();
    await expect.element(comboBox()).toHaveValue("Connecticut");
  });

  it("does nothing when the selected item is clicked again", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <>
        <Default onChange={onChange} />
        <button type="button">After ComboBox</button>
      </>,
    );
    await comboBox().click();
    await option("Alaska").click();
    await userEvent.tab();
    await comboBox().click();
    await option("Alaska").click();
    await expect.element(comboBox()).toHaveValue("Alaska");

    await userEvent.tab();
    await comboBox().click();
    await expect
      .element(option("Alaska"))
      .toHaveAttribute("aria-checked", "true");
    await expect
      .element(option("Alaska"))
      .toHaveClass("saltListItemDeprecated-highlighted");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not clear selection when input value changes", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Default onChange={onChange} />);
    await comboBox().click();
    await option("Alaska").click();
    await comboBox().click();
    await userEvent.keyboard("{Backspace}");

    await expect
      .element(option("Alaska"))
      .toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it.skip("clears selection when input is cleared", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<Default onChange={onChange} />);
    await comboBox().click();
    await option("Alaska").click();
    await comboBox().click();
    await comboBox().clear();
    await expect
      .element(option("Alaska"))
      .not.toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), null);
  });
});

describe("A deprecated multi-select combo box selection", () => {
  it("selects clicked items", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<MultiSelect onChange={onChange} />);
    await textbox().click();
    await option("Alaska").click();
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ["Alaska"]);
    await option("Alabama").click();
    expect(onChange).toHaveBeenCalledWith(expect.anything(), [
      "Alabama",
      "Alaska",
    ]);

    const pills = page.getByTestId("pill");
    await expect.poll(async () => (await pills.elements()).length).toBe(2);
    await expect.element(pills.nth(0)).toHaveTextContent("Alabama");
    await expect.element(pills.nth(1)).toHaveTextContent("Alaska");
    await expect
      .element(option("Alaska"))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(option("Alabama"))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(option("Alabama"))
      .toHaveClass("saltListItemDeprecated-highlighted");
  });

  it("clears input when an item is selected", async () => {
    await renderWithSalt(<MultiSelect />);
    await textbox().click();
    await userEvent.keyboard("ama");
    await expect.element(textbox()).toHaveValue("ama");
    await option().click();
    await expect.element(textbox()).toHaveValue("");
  });

  it("de-selects when the selected item is clicked again", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<MultiSelect onChange={onChange} />);
    await textbox().click();
    await option("Alabama").click();
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ["Alabama"]);
    await option("Alaska").click();
    expect(onChange).toHaveBeenCalledWith(expect.anything(), [
      "Alabama",
      "Alaska",
    ]);
    await option("Alabama").click();
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ["Alaska"]);

    await expect.element(page.getByTestId("pill")).toHaveLength(1);
    await expect.element(page.getByTestId("pill")).toHaveTextContent("Alaska");
    await expect
      .element(option("Alabama"))
      .not.toHaveAttribute("aria-selected", "true");
    await expect
      .element(option("Alaska"))
      .toHaveAttribute("aria-selected", "true");
  });

  it("de-selects when a selected pill is removed", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<MultiSelect onChange={onChange} />);
    await textbox().click();
    await option("Alabama").click();
    await option("Alaska").click();
    const pills = page.getByTestId("pill");
    await expect.element(pills).toHaveLength(2);

    await pills.nth(1).click();
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ["Alabama"]);
    await expect.element(pills).toHaveLength(1);
    await expect
      .element(option("Alabama"))
      .toHaveAttribute("aria-selected", "true");
  });

  it("de-selects all items when clear input is clicked", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<MultiSelect onChange={onChange} />);
    await textbox().click();
    await option("Alabama").click();
    await option("Alaska").click();
    await expect.element(page.getByTestId("pill")).toHaveLength(2);

    await page.getByRole("button", { name: "clear input" }).click();
    await expect.element(page.getByTestId("pill")).toHaveLength(0);
    expect(onChange).toHaveBeenCalledWith(null, []);
    const options = page.getByRole("option");
    await expect
      .poll(() => {
        const items = options.elements();
        return (
          items.length > 0 &&
          items.every((item) => !item.hasAttribute("aria-selected"))
        );
      })
      .toBe(true);
  });
});
