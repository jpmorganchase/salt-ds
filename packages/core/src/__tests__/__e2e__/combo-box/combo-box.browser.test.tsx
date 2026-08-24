import { ComboBox, Option } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { type KeyboardEventHandler, useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as comboBoxStories from "~stories/combo-box/combo-box.stories";
import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const {
  Default,
  Readonly,
  ReadonlyEmpty,
  WithDefaultSelected,
  Disabled,
  DisabledOption,
  Multiselect,
  WithFormField,
  Grouped,
  EmptyMessage,
  ComplexOption,
  ObjectValue,
  MultiplePills,
  MultiplePillsTruncated,
  SelectOnTab,
  LongList,
  PerformanceTest,
  Virtualized,
} = composeStories(comboBoxStories);

afterEach(() => vi.restoreAllMocks());

const input = () => page.getByRole("combobox");
const listbox = () => page.getByRole("listbox");

function comboBoxRoot() {
  const element = document.querySelector<HTMLElement>(".saltComboBox");
  if (!element) throw new Error("ComboBox root missing");
  return page.elementLocator(element);
}

async function typeFilter(value: string) {
  await input().click();
  await userEvent.keyboard(value);
}

async function expectActive(nameOrIndex: string | number) {
  await expect
    .poll(async () => {
      const activeId = input().element().getAttribute("aria-activedescendant");
      const options = await (typeof nameOrIndex === "number"
        ? page.getByRole("option")
        : page.getByRole("option", { name: nameOrIndex })
      ).elements();
      const option =
        typeof nameOrIndex === "number"
          ? options.at(nameOrIndex)
          : options.at(0);
      return option?.id === activeId;
    })
    .toBe(true);
}

describe("Given a ComboBox", () => {
  it.each(["mouse", "keyboard"])(
    "filters and selects with a %s",
    async (interaction) => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(<Default onSelectionChange={onSelectionChange} />);
      await typeFilter("Ala");
      if (interaction === "mouse") {
        const alaska = page.getByRole("option", { name: "Alaska" });
        await alaska.hover();
        await expectActive("Alaska");
        await alaska.click();
      } else {
        await expectActive("Alabama");
        await userEvent.keyboard("{ArrowDown}{Enter}");
      }
      await expect.element(input()).toHaveValue("Alaska");
      await expect.element(input()).toHaveFocus();
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alaska"]);
    },
  );

  it.each([
    [undefined, true],
    [true, true],
    [false, false],
  ] as const)("selectOnTab=%s selects=%s", async (selectOnTab, selects) => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <Default
        selectOnTab={selectOnTab}
        onSelectionChange={onSelectionChange}
      />,
    );
    await typeFilter("Ala");
    await userEvent.tab();
    if (selects) {
      await expect.element(input()).toHaveValue("Alabama");
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alabama"]);
    } else expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it.each([
    ["{Enter}", true],
    ["{Tab}", false],
  ] as const)("quick-selects with %s", async (key, staysFocused) => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <>
        <Default onSelectionChange={onSelectionChange} />
        <button type="button">After ComboBox</button>
      </>,
    );
    await typeFilter("C");
    await expectActive("California");
    if (key === "{Tab}") {
      await userEvent.tab();
    } else {
      await userEvent.keyboard(key);
    }
    await expect.element(input()).toHaveValue("California");
    if (staysFocused) await expect.element(input()).toHaveFocus();
    else {
      await expect
        .element(page.getByRole("button", { name: "After ComboBox" }))
        .toHaveFocus();
    }
  });

  it("toggles the list from its button", async () => {
    await renderWithSalt(<Default />);
    const trigger = page.getByRole("button");
    await expect.element(input()).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect.element(listbox()).toBeInTheDocument();
    await expect.element(input()).toHaveAttribute("aria-expanded", "true");
    await trigger.click();
    await expect.element(listbox()).not.toBeInTheDocument();
  });

  it("opens from the input and closes with Escape", async () => {
    await renderWithSalt(<Default />);
    await input().click();
    await expect.element(listbox()).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect.element(listbox()).not.toBeInTheDocument();
  });

  it("closes on outside pointer interaction and reports state", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(
      <div>
        <Default onOpenChange={onOpenChange} />
        <button type="button">Outside</button>
      </div>,
    );
    await input().click();
    expect(onOpenChange.mock.lastCall?.[0]).toBe(true);
    await page.getByRole("button", { name: "Outside" }).click();
    await expect.element(listbox()).not.toBeInTheDocument();
    expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
  });

  it("does not open from keyboard focus alone", async () => {
    await renderWithSalt(<Default />);
    await userEvent.tab();
    await expect.element(input()).toHaveFocus();
    await expect.element(listbox()).not.toBeInTheDocument();
  });

  it.each([
    ["{ArrowDown}", "Alabama"],
    ["{ArrowUp}", "Georgia"],
  ] as const)("opens and activates an edge item with %s", async (key, name) => {
    await renderWithSalt(<Default />);
    await userEvent.tab();
    await userEvent.keyboard(key);
    await expectActive(name);
  });

  it.each(["{ArrowDown}", "{ArrowUp}"])(
    "activates the selected option with %s",
    async (key) => {
      await renderWithSalt(<WithDefaultSelected />);
      await userEvent.tab();
      await userEvent.keyboard(key);
      const selected = page.getByRole("option", { name: "California" });
      await expect.element(selected).toHaveAttribute("aria-selected", "true");
      await expectActive("California");
    },
  );

  it("supports non-wrapping keyboard navigation", async () => {
    await renderWithSalt(<LongList />);
    await input().click();
    for (const [key, index] of [
      ["{ArrowDown}", 0],
      ["{ArrowUp}", 0],
      ["{PageDown}", 10],
      ["{PageUp}", 0],
      ["{End}", -1],
      ["{ArrowDown}", -1],
      ["{ArrowUp}", -2],
      ["{Home}", 0],
    ] as const) {
      await userEvent.keyboard(key);
      await expectActive(index);
    }
  });

  it("is immutable when read-only", async () => {
    await renderWithSalt(<Readonly />);
    const textbox = page.getByRole("textbox");
    await expect.element(textbox).toHaveAttribute("readonly");
    await expect.element(textbox).toHaveAttribute("aria-readonly", "true");
    await expect.element(textbox).not.toHaveAttribute("aria-expanded");
    await expect.element(textbox).toHaveValue("California");
    await textbox.click();
    await userEvent.keyboard("abc");
    await expect.element(textbox).toHaveValue("California");
  });

  it("omits a disabled input from pointer and keyboard focus", async () => {
    await renderWithSalt(
      <>
        <button type="button">Before</button>
        <Disabled />
        <button type="button">After</button>
      </>,
    );
    await expect.element(input()).toBeDisabled();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Before" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
    await input().click({ force: true });
    await expect.element(input()).not.toHaveFocus();
    await expect
      .element(comboBoxRoot())
      .not.toHaveClass("saltComboBox-focused");
  });

  it("drops focus when selection disables the control", async () => {
    function DisabledAfterSelection() {
      const [disabled, setDisabled] = useState(false);
      return (
        <Default
          disabled={disabled}
          onSelectionChange={() => setDisabled(true)}
        />
      );
    }
    await renderWithSalt(<DisabledAfterSelection />);
    await input().click();
    await page.getByRole("option", { name: "Alabama" }).click();
    await expect.element(input()).toBeDisabled();
    await expect.element(input()).not.toHaveFocus();
    await expect
      .element(comboBoxRoot())
      .not.toHaveClass("saltComboBox-focused");
  });

  it.each(["{Enter}", "{Tab}"])(
    "does not select a disabled option with %s",
    async (key) => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <DisabledOption
          selectOnTab
          multiselect={key === "{Tab}"}
          onSelectionChange={onSelectionChange}
        />,
      );
      await typeFilter("California");
      const option = page.getByRole("option", { name: "California" });
      await expect.element(option).toHaveAttribute("aria-disabled", "true");
      await userEvent.keyboard(key);
      if (key === "{Enter}") {
        await option.click({ force: true });
      }
      expect(onSelectionChange).not.toHaveBeenCalled();
    },
  );

  it("does not select on Tab while controlled closed", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <Default
        open={false}
        selectOnTab
        multiselect
        onSelectionChange={onSelectionChange}
      />,
    );
    await typeFilter("Alabama");
    await expect.element(listbox()).not.toBeInTheDocument();
    await userEvent.tab();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it.each(["mouse", "keyboard"])(
    "selects multiple options with a %s",
    async (interaction) => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <Multiselect onSelectionChange={onSelectionChange} />,
      );
      if (interaction === "mouse") {
        await input().click();
        await page.getByRole("option", { name: "Alabama" }).click();
        await page.getByRole("option", { name: "Alaska" }).click();
      } else {
        await userEvent.tab();
        await userEvent.keyboard("{ArrowDown}");
        await expectActive("Alabama");
        await userEvent.keyboard("{Enter}");
        await userEvent.keyboard("{ArrowDown}");
        await expectActive("Alaska");
        await userEvent.keyboard("{Enter}");
      }
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual([
        "Alabama",
        "Alaska",
      ]);
      for (const name of ["Alabama", "Alaska"]) {
        await expect
          .element(page.getByRole("option", { name }))
          .toHaveAttribute("aria-selected", "true");
        await expect
          .element(page.getByRole("button", { name: `Remove ${name}` }))
          .toBeVisible();
      }
      await expect.element(listbox()).toBeInTheDocument();
      await expect.element(input()).toHaveValue("");
    },
  );

  it.each([
    [SelectOnTab, true],
    [Multiselect, false],
  ] as const)("multiselect tab selection=%s", async (Story, selects) => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(<Story onSelectionChange={onSelectionChange} />);
    await typeFilter("Ala");
    await userEvent.tab();
    if (selects)
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alabama"]);
    else expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("does not deselect an existing multiselect value on Tab", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(<SelectOnTab onSelectionChange={onSelectionChange} />);
    await typeFilter("Ala");
    await userEvent.tab();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alabama"]);
    await expect
      .element(page.getByRole("button", { name: "Remove Alabama" }))
      .toBeVisible();

    await typeFilter("Alabama");
    await userEvent.tab();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    await expect
      .element(page.getByRole("button", { name: "Remove Alabama" }))
      .toBeVisible();
    await input().click();
    await expect
      .element(page.getByRole("option", { name: "Alabama" }))
      .toHaveAttribute("aria-selected", "true");
  });

  it("supports FormField labels and descriptions", async () => {
    await renderWithSalt(<WithFormField />);
    await expect.element(input()).toHaveAccessibleName("State");
    await expect
      .element(input())
      .toHaveAccessibleDescription("Pick a US state");
    await page.getByText("State", { exact: true }).click();
    await expect.element(input()).toHaveFocus();
    await expect.element(listbox()).toBeInTheDocument();
  });

  it("supports groups and empty messages", async () => {
    await renderWithSalt(<Grouped />);
    await input().click();
    const group = page.getByRole("group", { name: "US" });
    await expect.element(group).toBeInTheDocument();
    await expect
      .element(group.getByRole("option", { name: "New York" }))
      .toBeInTheDocument();
    await renderWithSalt(<EmptyMessage />);
    await input().click();
    await expect
      .element(page.getByRole("option"))
      .toHaveTextContent('No results found for "Yelloww"');
  });

  it.each([
    [ComplexOption, /Kamron Marisa/, "Kamron Marisa"],
    [ObjectValue, /Jane Doe/, "Jane Doe"],
  ] as const)("selects complex values", async (Story, optionName, value) => {
    await renderWithSalt(<Story />);
    await input().click();
    if (value === "Jane Doe") await userEvent.keyboard("Jane");
    await page.getByRole("option", { name: optionName }).click();
    if (value === "Jane Doe") {
      await input().click();
      await expect
        .element(page.getByRole("option", { name: optionName }))
        .toHaveAttribute("aria-selected", "true");
    } else await expect.element(input()).toHaveValue(value);
  });

  it("respects default selection and permits replacement", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <WithDefaultSelected onSelectionChange={onSelectionChange} />,
    );
    await expect.element(input()).toHaveValue("California");
    await input().click();
    await expect
      .element(page.getByRole("option", { name: "California" }))
      .toHaveAttribute("aria-selected", "true");
    await input().fill("");
    await page.getByRole("option", { name: "Alabama" }).click();
    await expect.element(input()).toHaveValue("Alabama");
  });

  it.each([
    ["default", false],
    ["controlled", true],
  ] as const)("supports %s open state", async (mode, staysOpen) => {
    await renderWithSalt(
      mode === "default" ? <Default defaultOpen /> : <Default open />,
    );
    await expect.element(listbox()).toBeInTheDocument();
    await page.getByRole("button").click();
    if (staysOpen) await expect.element(listbox()).toBeInTheDocument();
    else await expect.element(listbox()).not.toBeInTheDocument();
  });

  it("does not render list controls without options", async () => {
    await renderWithSalt(<ComboBox open />);
    await expect.element(listbox()).not.toBeInTheDocument();
    await expect.element(page.getByRole("button")).toHaveLength(0);
  });

  it("clears a single selection but retains multiselect selection", async () => {
    await renderWithSalt(<WithDefaultSelected />);
    await input().click();
    await input().fill("");
    await expect
      .element(page.getByRole("option", { name: "California" }))
      .toHaveAttribute("aria-selected", "false");
    await renderWithSalt(<WithDefaultSelected multiselect />);
    await input().click();
    await userEvent.keyboard("Ala");
    await input().fill("");
    await expect
      .element(page.getByRole("option", { name: "California" }))
      .toHaveAttribute("aria-selected", "true");
  });

  it("clears active descendant when the filter is cleared", async () => {
    await renderWithSalt(<Default />);
    await typeFilter("C");
    await expectActive("California");
    await input().fill("");
    await expect.element(input()).not.toHaveAttribute("aria-activedescendant");
  });

  it("wraps pills and expands a truncated group on focus", async () => {
    await renderWithSalt(<MultiplePills />);
    await expect.element(page.getByRole("button")).toHaveLength(4);
    await renderWithSalt(<MultiplePillsTruncated />);
    await expect.element(page.getByRole("button")).toHaveLength(2);
    await expect.element(page.getByTestId(/OverflowMenuIcon/i)).toBeVisible();
    await input().click();
    await expect.element(page.getByRole("button")).toHaveLength(4);
  });

  it("navigates between pills and input", async () => {
    await renderWithSalt(<MultiplePills />);
    await userEvent.tab();
    for (const name of ["Remove Alabama", "Remove Alaska", "Remove Arizona"]) {
      await expect.element(page.getByRole("button", { name })).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
    }
    await expect.element(input()).toHaveFocus();
    for (const name of ["Remove Arizona", "Remove Alaska", "Remove Alabama"]) {
      await userEvent.keyboard("{ArrowLeft}");
      await expect.element(page.getByRole("button", { name })).toHaveFocus();
    }
  });

  it("tabs from the first pill to the input", async () => {
    await renderWithSalt(<MultiplePills />);
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Remove Alabama" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(input()).toHaveFocus();
  });

  it("removes a hidden selected pill with Backspace", async () => {
    await renderWithSalt(<MultiplePills />);
    await typeFilter("UNKNOWN");
    await userEvent.keyboard("{Home}{Backspace}");
    await expect.element(page.getByTestId("pill")).toHaveLength(2);
  });

  it("renders a configured floating component", async () => {
    await renderWithSalt(
      <CustomFloatingComponentProvider>
        <Default open />
      </CustomFloatingComponentProvider>,
    );
    await expect
      .element(page.getByTestId(FLOATING_TEST_ID))
      .toBeInTheDocument();
  });

  it.each([
    ["defaultValue", "Alaska"],
    ["both", "Alaska"],
    ["defaultSelected", "Alaska"],
  ] as const)("resolves %s precedence", async (mode, value) => {
    await renderWithSalt(
      <ComboBox
        defaultValue={mode !== "defaultSelected" ? "Alaska" : undefined}
        defaultSelected={
          mode === "both"
            ? ["Alabama"]
            : mode === "defaultSelected"
              ? ["Alaska"]
              : undefined
        }
      >
        <Option value="Alabama" />
        <Option value="Alaska" />
      </ComboBox>,
    );
    await expect.element(input()).toHaveValue(value);
  });

  it("does not blur when selecting from the list", async () => {
    const onBlur = vi.fn();
    await renderWithSalt(<Default onBlur={onBlur} />);
    await input().click();
    await page.getByRole("option").nth(0).click();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("opens a 10000-item list", async () => {
    await renderWithSalt(<PerformanceTest />);
    await input().click();
    await expect.element(listbox()).toBeVisible();
  });

  it("removes active descendant whenever the popup closes", async () => {
    await renderWithSalt(<Default />);
    await input().click();
    await page.getByRole("option", { name: "Alaska" }).click();
    await expect.element(input()).not.toHaveAttribute("aria-activedescendant");
    await input().click();
    await expectActive("Alaska");
    await userEvent.keyboard("{Escape}");
    await expect.element(input()).not.toHaveAttribute("aria-activedescendant");
  });

  it("defaults autocomplete off and permits override", async () => {
    await renderWithSalt(<Default />);
    await expect.element(input()).toHaveAttribute("autocomplete", "off");
    await renderWithSalt(<Default inputProps={{ autoComplete: "on" }} />);
    await expect.element(input()).toHaveAttribute("autocomplete", "on");
  });

  it("permits focus to move from keydown capture", async () => {
    function TestSetup() {
      const buttonRef = useRef<HTMLButtonElement>(null);
      const moveFocus: KeyboardEventHandler = (event) => {
        if (event.key === "ArrowRight") buttonRef.current?.focus();
      };
      return (
        <>
          <ComboBox onKeyDownCapture={moveFocus}>
            <Option value={1}>1</Option>
          </ComboBox>
          <button ref={buttonRef} type="button">
            Target
          </button>
        </>
      );
    }
    await renderWithSalt(<TestSetup />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Target" }))
      .toHaveFocus();
  });

  it("deletes a pill only after the ComboBox is active", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <MultiplePills onSelectionChange={onSelectionChange} />,
    );
    await page.getByTestId("pill").nth(0).click();
    expect(onSelectionChange).not.toHaveBeenCalled();
    await expect.element(page.getByTestId("pill")).toHaveLength(3);
    await input().click();
    await page.getByTestId("pill").nth(0).click();
    expect(onSelectionChange).toHaveBeenCalled();
    await expect.element(page.getByTestId("pill")).toHaveLength(2);
  });

  it("forwards OverlayProps", async () => {
    await renderWithSalt(
      <Default OverlayProps={{ "data-testid": "overlay" }} open />,
    );
    await expect
      .element(page.getByTestId("overlay"))
      .toHaveAttribute("role", "listbox");
  });

  it("scrolls a long filtered list with the mouse wheel", async () => {
    await renderWithSalt(<LongList />);
    await typeFilter("A");
    const anguilla = page.getByRole("option", { name: "Anguilla" });
    await anguilla.hover();
    await anguilla.wheel({ delta: { y: 15_000 } });
    await expect
      .element(page.getByRole("option", { name: "Zimbabwe" }))
      .toBeVisible();
  });

  it("navigates virtualized options without wrapping", async () => {
    await renderWithSalt(<Virtualized />);
    await input().click();
    for (const name of ["a", "b", "c", "d", "e", "f", "g"]) {
      await userEvent.keyboard("{ArrowDown}");
      await expectActive(name);
    }
    await userEvent.keyboard("{ArrowDown}");
    await expectActive("g");
    await userEvent.keyboard("{ArrowUp}");
    await expectActive("f");
  });

  it("omits empty form ARIA and applies input names", async () => {
    await renderWithSalt(<Default name="city" />);
    await expect.element(input()).toHaveAttribute("name", "city");

    await renderWithSalt(
      <Default name="city" inputProps={{ name: "override" }} />,
    );
    await expect.element(input()).not.toHaveAttribute("aria-describedby");
    await expect.element(input()).not.toHaveAttribute("aria-labelledby");
    await expect.element(input()).toHaveAttribute("name", "override");
  });

  it.each([
    [Readonly, "California"],
    [ReadonlyEmpty, "—"],
  ] as const)("renders read-only value '%s'", async (Story, value) => {
    await renderWithSalt(<Story />);
    await expect.element(page.getByRole("textbox")).toHaveValue(value);
  });
});
