import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as comboBoxStories from "~stories/combobox/combobox.stories";

const { Default, WithInitialSelection, WithFreeText } =
  composeStories(comboBoxStories);

const comboBox = () => page.getByRole("combobox");
const option = (name: string) =>
  page.getByRole("option", { name, exact: true });

async function expectOpen(open: boolean) {
  if (open) {
    await expect.element(page.getByRole("listbox")).toBeInTheDocument();
  } else {
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
  }
}

async function expectHighlighted(name: string) {
  const item = option(name);
  await expect.element(item).toHaveClass(/saltHighlighted/, /saltFocusVisible/);
}

describe("A lab combo box", () => {
  describe("with nothing selected", () => {
    it("does not highlight any item with a focus ring when focused", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();

      const options = page.getByRole("option");
      await expect
        .poll(() => {
          const items = options.elements();
          return (
            items.length > 0 &&
            items.every((item) => !/saltHighlighted/.test(item.className))
          );
        })
        .toBe(true);
    });

    it("clears an unselected input value when blurred", async () => {
      await renderWithSalt(
        <>
          <Default />
          <button type="button">After ComboBox</button>
        </>,
      );
      await userEvent.tab();
      await userEvent.keyboard("Alaska");
      await expect.element(comboBox()).toHaveValue("Alaska");
      await userEvent.keyboard("{ArrowDown}");
      await expect.element(comboBox()).toHaveValue("Alaska");
      await userEvent.keyboard("{Backspace}");
      await expect.element(comboBox()).toHaveValue("Alask");
      await userEvent.keyboard("{Tab}");

      await expect.element(comboBox()).toHaveValue("");
      await expect
        .element(page.getByRole("button", { name: "After ComboBox" }))
        .toHaveFocus();
    });

    it("reconciles input value with a selected item when blurred", async () => {
      await renderWithSalt(
        <>
          <Default />
          <button type="button">After ComboBox</button>
        </>,
      );
      await userEvent.tab();
      await userEvent.keyboard("Alaska{ArrowDown}{Enter}{Backspace}{Tab}");

      await expect.element(comboBox()).toHaveValue("Alaska");
    });

    it("starts highlighting from the first item on ArrowDown", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}");
      await expectHighlighted("Alabama");
      await userEvent.keyboard("{ArrowDown}");
      await expectHighlighted("Alaska");
    });

    it("selects the first item with Enter when input text has no highlight", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(<Default onSelectionChange={onSelectionChange} />);
      await userEvent.tab();
      await userEvent.keyboard("A{Enter}");

      await expect.element(comboBox()).toHaveValue("Alabama");
      await expectOpen(false);
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.anything(),
        "Alabama",
      );
    });

    it("selects the highlighted item with Enter", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(<Default onSelectionChange={onSelectionChange} />);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}{Enter}");

      const firstItem = Default.args.source?.[0];
      if (!firstItem) throw new Error("Invalid test: source is missing");
      await expect.element(comboBox()).toHaveValue(firstItem);
      await expectOpen(false);
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.anything(),
        firstItem,
      );
    });

    it("does not select the highlighted item with Space", async () => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(<Default onSelectionChange={onSelectionChange} />);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}{ArrowDown} ");

      await expect
        .element(page.getByRole("option", { selected: true }))
        .not.toBeInTheDocument();
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("removes list highlight and closes on Tab", async () => {
      await renderWithSalt(
        <>
          <Default />
          <button type="button">After ComboBox</button>
        </>,
      );
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}{Tab}");
      await expectOpen(false);
    });

    it("clears the input and closes the list on Escape", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await userEvent.keyboard("Alabama{ArrowDown}{Escape}");

      await expect.element(comboBox()).toHaveValue("");
      await expectOpen(false);
    });

    it("reconciles input value on Escape after selecting a new item", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await userEvent.keyboard("Alabama{ArrowDown}{Enter}{Backspace}{Escape}");

      await expect.element(comboBox()).toHaveValue("Alabama");
    });
  });

  it("highlights a selected item with a focus ring when focused", async () => {
    await renderWithSalt(<WithInitialSelection />);
    await userEvent.tab();
    await expectHighlighted("Brown");
  });
});

describe("A lab combo box that allows free text", () => {
  it("does not modify input value when blurred", async () => {
    await renderWithSalt(
      <>
        <WithFreeText />
        <button type="button">After ComboBox</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.keyboard("Alaska{ArrowDown}{Backspace}{Tab}");

    await expect.element(comboBox()).toHaveValue("Alask");
  });

  it("selects a matching input value when blurred", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <>
        <WithFreeText onSelectionChange={onSelectionChange} />
        <button type="button">After ComboBox</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.keyboard("Baby blue{ArrowDown}{Tab}");
    await expect.element(comboBox()).toHaveValue("Baby blue");

    comboBox().element().focus();
    await expect
      .element(option("Baby blue"))
      .toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.anything(),
      "Baby blue",
    );
  });

  it("clears the input on Escape", async () => {
    await renderWithSalt(<WithFreeText />);
    await userEvent.tab();
    await userEvent.keyboard("Alaska{ArrowDown}{Enter}{Backspace}{Escape}");

    await expect.element(comboBox()).toHaveValue("");
  });
});
