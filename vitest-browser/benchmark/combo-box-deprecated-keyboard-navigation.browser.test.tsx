import { composeStories } from "@storybook/react-vite";
import { version } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as comboBoxStories from "~stories/combobox/combobox-deprecated.stories";
import { pasteValue } from "../interactions";
import { renderWithSalt } from "../render";

const {
  Default,
  MultiSelectWithInitialSelection,
  WithInitialSelection,
  WithFreeText,
  MultiSelect,
  MultiSelectWithFreeTextItem,
} = composeStories(comboBoxStories);

const comboBox = () => page.getByRole("combobox");
const textbox = () => page.getByRole("textbox");
const option = (name: string) =>
  page.getByRole("option", { name, exact: true });
const pills = () => page.getByTestId("pill");

async function expectOpen(open: boolean) {
  if (open) {
    await expect.element(page.getByRole("listbox")).toBeInTheDocument();
  } else {
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
  }
}

async function expectHighlighted(name: string) {
  await expect
    .element(option(name))
    .toHaveClass("saltListItemDeprecated-highlighted");
  await expect
    .element(option(name))
    .toHaveClass("saltListItemDeprecated-focusVisible");
}

async function expectPills(names: string[]) {
  const locator = pills();
  await expect.element(locator).toHaveLength(names.length);
  for (const [index, name] of names.entries()) {
    await expect.element(locator.nth(index)).toHaveTextContent(name);
  }
}

describe("A deprecated combo box", () => {
  describe("with nothing selected", () => {
    it("does not highlight any item with a focus ring when focused", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      const options = await page.getByRole("option").elements();
      expect(
        options.every(
          (item) =>
            !item.classList.contains("saltListItemDeprecated-highlighted"),
        ),
      ).toBe(true);
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
      await userEvent.keyboard("{ArrowDown}");
      await expect.element(comboBox()).toHaveValue("Alaska");
      await userEvent.keyboard("{Backspace}");
      await expect.element(comboBox()).toHaveValue("Alask");
      await userEvent.keyboard("{Tab}");
      await expect.element(comboBox()).toHaveValue("");
    });

    it("reconciles input value with a selected item when blurred", async () => {
      await renderWithSalt(
        <>
          <Default />
          <button type="button">After ComboBox</button>
        </>,
      );
      await userEvent.tab();
      await userEvent.keyboard("Alaska{ArrowDown}{Enter}");
      await expect.element(comboBox()).toHaveValue("Alaska");
      await userEvent.keyboard("{Backspace}");
      await expect.element(comboBox()).toHaveValue("Alask");
      await userEvent.keyboard("{Tab}");
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
      const onChange = vi.fn();
      await renderWithSalt(<Default onChange={onChange} />);
      await userEvent.tab();
      await userEvent.keyboard("A{Enter}");
      await expect.element(comboBox()).toHaveValue("Alabama");
      await expectOpen(false);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), "Alabama");
    });

    it("selects the highlighted item with Enter", async () => {
      const onChange = vi.fn();
      await renderWithSalt(<Default onChange={onChange} />);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}{Enter}");
      const firstItem = Default.args.source?.[0];
      if (!firstItem) throw new Error("Invalid test: source is missing");
      await expect.element(comboBox()).toHaveValue(firstItem);
      await expectOpen(false);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), firstItem);
    });

    it("does not select the highlighted item with Space", async () => {
      const onChange = vi.fn();
      await renderWithSalt(<Default onChange={onChange} />);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowDown}{ArrowDown} ");
      await expect
        .element(page.getByRole("option", { selected: true }))
        .not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
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

    it("reconciles input value on Escape after selecting an item", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await userEvent.keyboard("Alabama{ArrowDown}{Enter}");
      await expect.element(comboBox()).toHaveValue("Alabama");
      await userEvent.keyboard("{Backspace}{Escape}");
      await expect.element(comboBox()).toHaveValue("Alabama");
    });
  });

  it.skipIf(version.startsWith("18"))(
    "highlights the selected item with a focus ring",
    async () => {
      await renderWithSalt(<WithInitialSelection />);
      await userEvent.tab();
      await expectHighlighted("Brown");
    },
  );
});

describe("A deprecated combo box that allows free text", () => {
  it("does not modify input value when blurred", async () => {
    await renderWithSalt(
      <>
        <WithFreeText />
        <button type="button">After ComboBox</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.keyboard("Baby blue{ArrowDown}");
    await expect.element(comboBox()).toHaveValue("Baby blue");
    await userEvent.keyboard("{Backspace}{Tab}");
    await expect.element(comboBox()).toHaveValue("Baby blu");
  });

  it("selects a matching input value when blurred", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <>
        <WithFreeText onChange={onChange} />
        <button type="button">After ComboBox</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.keyboard("Baby blue{ArrowDown}{Tab}");
    await expect.element(comboBox()).toHaveValue("Baby blue");
    comboBox().element().focus();
    await expect
      .element(option("Baby blue"))
      .toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenCalledWith(expect.anything(), "Baby blue");
  });

  it("clears the input on Escape", async () => {
    await renderWithSalt(<WithFreeText />);
    await userEvent.tab();
    await userEvent.keyboard("Alaska{ArrowDown}{Enter}");
    await expect.element(comboBox()).toHaveValue("Alaska");
    await userEvent.keyboard("{Backspace}{Escape}");
    await expect.element(comboBox()).toHaveValue("");
  });
});

describe("A deprecated multi-select combo box", () => {
  describe("with nothing selected", () => {
    it("does not highlight any item with a focus ring when focused", async () => {
      await renderWithSalt(<MultiSelect />);
      await userEvent.tab();
      const options = await page.getByRole("option").elements();
      expect(
        options.every(
          (item) =>
            !item.classList.contains("saltListItemDeprecated-highlighted"),
        ),
      ).toBe(true);
    });

    it("clears input value when blurred", async () => {
      await renderWithSalt(
        <>
          <MultiSelect />
          <button type="button">After ComboBox</button>
        </>,
      );
      await userEvent.tab();
      await userEvent.keyboard("Alaska{Tab}");
      await expect.element(textbox()).toHaveValue("");
    });

    it("adds unique and valid delimited items only", async () => {
      const onChange = vi.fn();
      await renderWithSalt(<MultiSelect onChange={onChange} />);
      await userEvent.tab();
      pasteValue(textbox(), "Alaska, Alabama, Alaska, Missing Item");
      await expectPills(["Alaska", "Alabama"]);
      await expect
        .element(option("Alaska"))
        .toHaveAttribute("aria-selected", "true");
      await expect
        .element(option("Alabama"))
        .toHaveAttribute("aria-selected", "true");
      expect(onChange).toHaveBeenCalledWith(null, ["Alaska", "Alabama"]);
    });

    it("starts highlighting from the first item on ArrowDown", async () => {
      await renderWithSalt(<MultiSelect />);
      await userEvent.tab();
      await userEvent.keyboard("{End}{ArrowDown}");
      await expectHighlighted("Alabama");
      await userEvent.keyboard("{ArrowDown}");
      await expectHighlighted("Alaska");
    });

    it("selects the first item with Enter when input text has no highlight", async () => {
      const onChange = vi.fn();
      await renderWithSalt(<MultiSelect onChange={onChange} />);
      await userEvent.tab();
      await userEvent.keyboard("A{Enter}");
      await expectPills(["Alabama"]);
      await expect
        .element(option("Alabama"))
        .toHaveAttribute("aria-selected", "true");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), ["Alabama"]);
    });

    it("selects highlighted items with Enter", async () => {
      const onChange = vi.fn();
      await renderWithSalt(<MultiSelect onChange={onChange} />);
      await userEvent.tab();
      await userEvent.keyboard("{End}{ArrowDown}{Enter}");
      await expectPills(["Alabama"]);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), ["Alabama"]);

      await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
      await expectPills(["Alabama", "Arizona"]);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), [
        "Alabama",
        "Arizona",
      ]);
      await expect
        .element(option("Alabama"))
        .toHaveAttribute("aria-selected", "true");
      await expect
        .element(option("Arizona"))
        .toHaveAttribute("aria-selected", "true");
      await expect
        .element(option("Arizona"))
        .toHaveClass("saltListItemDeprecated-highlighted");
    });

    it("does not select the highlighted item with Space", async () => {
      const onChange = vi.fn();
      await renderWithSalt(<MultiSelect onChange={onChange} />);
      await userEvent.tab();
      await userEvent.keyboard("{End}{ArrowDown}{ArrowDown} ");
      await expect
        .element(page.getByRole("option", { selected: true }))
        .not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("removes list highlight and closes on Tab", async () => {
      await renderWithSalt(
        <>
          <MultiSelect />
          <button type="button">After ComboBox</button>
        </>,
      );
      await userEvent.tab();
      await userEvent.keyboard("{End}{ArrowDown}{Tab}");
      await expectOpen(false);
    });

    it.each([
      ["Alabama", ["Alabama"]],
      ["Non existent", []],
    ] as const)(
      "adds only a valid item on Tab: %s",
      async (value, expectedPills) => {
        await renderWithSalt(
          <>
            <MultiSelect />
            <button type="button">After ComboBox</button>
          </>,
        );
        await userEvent.tab();
        await userEvent.keyboard(`${value}{Tab}`);
        await expectPills([...expectedPills]);
      },
    );

    it("clears the input and closes the list on Escape", async () => {
      await renderWithSalt(<MultiSelect />);
      await userEvent.tab();
      await userEvent.keyboard("Alabama{ArrowDown}{Escape}");
      await expect.element(textbox()).toHaveValue("");
      await expectOpen(false);
    });
  });

  describe("with selected items", () => {
    it.skip("does not highlight any item with a focus ring", async () => {
      await renderWithSalt(<MultiSelectWithInitialSelection />);
      textbox().element().focus();
      const options = await page.getByRole("option").elements();
      expect(
        options.every(
          (item) =>
            !item.classList.contains("saltListItemDeprecated-highlighted"),
        ),
      ).toBe(true);
    });

    it("puts the focus ring on the pill group with ArrowLeft", async () => {
      await renderWithSalt(<MultiSelectWithInitialSelection />);
      await userEvent.tab();
      const items = pills();
      const pillElements = await items.elements();
      expect(
        pillElements.every(
          (pill) => !pill.classList.contains("saltInputPill-pillActive"),
        ),
      ).toBe(true);
      await userEvent.keyboard("{ArrowLeft}");
      await expect
        .element(items.nth(-1))
        .toHaveClass("saltInputPill-pillActive");
    });

    it("moves the focus ring from pills to the list with ArrowDown", async () => {
      await renderWithSalt(<MultiSelectWithInitialSelection />);
      await userEvent.tab();
      await userEvent.keyboard("{ArrowLeft}");
      await expect
        .element(pills().nth(-1))
        .toHaveClass("saltInputPill-pillActive");
      await userEvent.keyboard("{ArrowDown}");
      const pillElements = await pills().elements();
      expect(
        pillElements.every(
          (pill) => !pill.classList.contains("saltInputPill-pillActive"),
        ),
      ).toBe(true);
      await expect
        .element(option("Alabama"))
        .toHaveClass("saltListItemDeprecated-focusVisible");
    });

    it.each([
      [
        "Colorado",
        ["Alaska", "Arkansas", "Connecticut", "Hawaii", "Kansas", "Colorado"],
      ],
      ["Alaska", ["Alaska", "Arkansas", "Connecticut", "Hawaii", "Kansas"]],
    ] as const)(
      "adds only an unselected item on Tab: %s",
      async (value, expectedPills) => {
        await renderWithSalt(
          <>
            <MultiSelectWithInitialSelection />
            <button type="button">After ComboBox</button>
          </>,
        );
        await userEvent.tab();
        await userEvent.keyboard(`${value}{Tab}`);
        await expectPills([...expectedPills]);
      },
    );

    it("de-selects selected list items with Enter", async () => {
      const onChange = vi.fn();
      await renderWithSalt(
        <MultiSelectWithInitialSelection onChange={onChange} />,
      );
      await userEvent.tab();
      await userEvent.keyboard("{End}{ArrowDown}{ArrowDown}{Enter}");
      await expectPills(["Arkansas", "Connecticut", "Hawaii", "Kansas"]);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), [
        "Arkansas",
        "Connecticut",
        "Hawaii",
        "Kansas",
      ]);
      await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
      await expectPills(["Connecticut", "Hawaii", "Kansas"]);
      expect(onChange).toHaveBeenCalledWith(expect.anything(), [
        "Connecticut",
        "Hawaii",
        "Kansas",
      ]);
    });

    it("de-selects selected pills with Enter", async () => {
      const onChange = vi.fn();
      await renderWithSalt(
        <MultiSelectWithInitialSelection onChange={onChange} />,
      );
      await userEvent.tab();
      await userEvent.keyboard("{ArrowLeft}{Enter}");
      await expect
        .element(page.getByRole("option", { selected: true }))
        .toHaveLength(4);
      expect(onChange).toHaveBeenCalledWith(null, [
        "Alaska",
        "Arkansas",
        "Connecticut",
        "Hawaii",
      ]);
      await userEvent.keyboard("{ArrowLeft}{Enter}");
      await expect
        .element(page.getByRole("option", { selected: true }))
        .toHaveLength(3);
      expect(onChange).toHaveBeenCalledWith(null, [
        "Alaska",
        "Arkansas",
        "Connecticut",
      ]);
    });
  });
});

describe("A deprecated multi-select combo box that allows free text", () => {
  it("adds unique delimited items only", async () => {
    const onChange = vi.fn();
    await renderWithSalt(<MultiSelectWithFreeTextItem onChange={onChange} />);
    await userEvent.tab();
    pasteValue(textbox(), "Alaska, Alabama, Alaska, Non existent");
    await expectPills(["Alaska", "Alabama", "Non existent"]);
    await expect
      .element(option("Alaska"))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(option("Alabama"))
      .toHaveAttribute("aria-selected", "true");
    expect(onChange).toHaveBeenCalledWith(null, [
      "Alaska",
      "Alabama",
      "Non existent",
    ]);
  });

  it("adds any free-text item on Tab", async () => {
    await renderWithSalt(
      <>
        <MultiSelectWithFreeTextItem />
        <button type="button">After ComboBox</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.keyboard("Non existent{Tab}");
    await expectPills(["Non existent"]);
  });

  it("does not add a duplicate free-text item", async () => {
    await renderWithSalt(
      <>
        <MultiSelectWithFreeTextItem />
        <button type="button">After ComboBox</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.keyboard("Non existent{Enter}");
    await expectPills(["Non existent"]);
    await userEvent.keyboard("Non existent{Tab}");
    await expectPills(["Non existent"]);
  });

  it.each([
    [
      "Alabama",
      ["Alaska", "Arkansas", "Connecticut", "Hawaii", "Kansas", "Alabama"],
    ],
    ["Alaska", ["Alaska", "Arkansas", "Connecticut", "Hawaii", "Kansas"]],
  ] as const)(
    "adds only unselected free text with initial selection: %s",
    async (value, expectedPills) => {
      await renderWithSalt(
        <>
          <MultiSelectWithInitialSelection allowFreeText />
          <button type="button">After ComboBox</button>
        </>,
      );
      await userEvent.tab();
      await userEvent.keyboard(`${value}{Tab}`);
      await expectPills([...expectedPills]);
    },
  );
});
