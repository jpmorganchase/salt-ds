import { Dropdown, FormField, FormFieldLabel, Option } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { type KeyboardEventHandler, useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { trackDefaultPrevented } from "~browser-test-utils/interactions";
import { renderWithSalt } from "~browser-test-utils/render";
import * as dropdownStories from "~stories/dropdown/dropdown.stories";
import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const {
  Default,
  Readonly,
  Disabled,
  DisabledOption,
  Multiselect,
  WithFormField,
  Grouped,
  ComplexOption,
  CustomValue,
  WithDefaultSelected,
  ObjectValue,
  LongList,
  PerformanceTest,
  PerformanceTestOneThousand,
} = composeStories(dropdownStories);

const CORE_TYPEAHEAD_RESET_MS = 500;

async function withFakeTimers<T extends { unmount: () => Promise<void> }>(
  render: () => Promise<T>,
  run: () => Promise<void>,
) {
  vi.useFakeTimers();
  try {
    const rendered = await render();
    try {
      await run();
    } finally {
      await rendered.unmount();
      expect(vi.getTimerCount()).toBe(0);
    }
  } finally {
    vi.useRealTimers();
  }
}

afterEach(() => vi.restoreAllMocks());

const combobox = () => page.getByRole("combobox");
const listbox = () => page.getByRole("listbox");

function collapsedList() {
  const element = document.querySelector<HTMLElement>(
    ".saltOptionList-collapsed",
  );
  if (!element) throw new Error("Collapsed option list missing");
  return page.elementLocator(element);
}

async function expectActive(nameOrIndex: string | number) {
  await expect
    .poll(async () => {
      const activeId = combobox()
        .element()
        .getAttribute("aria-activedescendant");
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

describe("Given a core Dropdown", () => {
  it.each(["mouse", "keyboard"])(
    "selects an option with a %s",
    async (interaction) => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(<Default onSelectionChange={onSelectionChange} />);
      await combobox().click();
      if (interaction === "mouse") {
        const alaska = page.getByRole("option", { name: "Alaska" });
        await alaska.hover();
        await expectActive("Alaska");
        await alaska.click();
      } else {
        await expectActive("Alabama");
        await userEvent.keyboard("{ArrowDown}{Enter}");
      }
      await expect.element(combobox()).toHaveFocus();
      await expect.element(combobox()).toHaveTextContent("Alaska");
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alaska"]);
    },
  );

  it.each([
    ["{Enter}", true],
    ["{Tab}", false],
  ] as const)("quick-selects with %s", async (key, staysFocused) => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <>
        <Default onSelectionChange={onSelectionChange} />
        <button type="button">After Dropdown</button>
      </>,
    );
    await combobox().click();
    await expectActive("Alabama");
    await userEvent.keyboard(key);
    await expect.element(combobox()).toHaveTextContent("Alabama");
    expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alabama"]);
    if (staysFocused) await expect.element(combobox()).toHaveFocus();
    else {
      await expect
        .element(page.getByRole("button", { name: "After Dropdown" }))
        .toHaveFocus();
    }
  });

  it("opens when clicked", async () => {
    await renderWithSalt(<Default />);
    await expect.element(combobox()).toHaveAttribute("aria-expanded", "false");
    await combobox().click();
    await expect.element(listbox()).toBeInTheDocument();
    await expect.element(combobox()).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on outside pointer interaction and reports state", async () => {
    const onOpenChange = vi.fn();
    await renderWithSalt(
      <>
        <Default onOpenChange={onOpenChange} />
        <button
          style={{ left: 0, position: "fixed", top: 0, zIndex: 2000 }}
          type="button"
        >
          Outside
        </button>
      </>,
    );
    await combobox().click();
    expect(onOpenChange.mock.lastCall?.[0]).toBe(true);
    await page.getByRole("button", { name: "Outside" }).click();
    await expect.element(listbox()).not.toBeInTheDocument();
    expect(onOpenChange.mock.lastCall?.[0]).toBe(false);
  });

  it("closes with Escape", async () => {
    await renderWithSalt(<Default />);
    await combobox().click();
    await userEvent.keyboard("{Escape}");
    await expect.element(listbox()).not.toBeInTheDocument();
  });

  it("does not open from keyboard focus alone", async () => {
    await renderWithSalt(<Default />);
    await userEvent.tab();
    await expect.element(combobox()).toHaveFocus();
    await expect.element(listbox()).not.toBeInTheDocument();
    await expect.element(combobox()).toHaveAttribute("aria-expanded", "false");
  });

  it.each([
    ["{ArrowDown}", "Alabama"],
    ["{ArrowUp}", "Georgia"],
  ] as const)(
    "opens and activates an edge option with %s",
    async (key, name) => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await userEvent.keyboard(key);
      await expectActive(name);
    },
  );

  it.each(["{ArrowDown}", "{ArrowUp}"])(
    "activates the selected option with %s",
    async (key) => {
      await renderWithSalt(<WithDefaultSelected />);
      await userEvent.tab();
      await userEvent.keyboard(key);
      const california = page.getByRole("option", { name: "California" });
      await expect.element(california).toHaveAttribute("aria-selected", "true");
      await expectActive("California");
    },
  );

  it("supports non-wrapping keyboard navigation", async () => {
    await renderWithSalt(<LongList />);
    await combobox().click();
    await expectActive(0);
    for (const [key, index] of [
      ["{ArrowUp}", 0],
      ["{ArrowDown}", 1],
      ["{PageDown}", 14],
      ["{PageUp}", 1],
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
    await expect.element(combobox()).toHaveAttribute("aria-readonly", "true");
    await expect.element(combobox()).toHaveTextContent("California");
    await combobox().click();
    await expect.element(listbox()).not.toBeInTheDocument();
    await userEvent.keyboard("abc");
    await expect.element(combobox()).toHaveTextContent("California");
  });

  it.each([
    [undefined, "—"],
    ["", "—"],
    ["Custom value", "Custom value"],
  ] as const)("renders read-only value %s as %s", async (value, text) => {
    await renderWithSalt(
      <Dropdown readOnly value={value}>
        <Option value="Alabama" />
      </Dropdown>,
    );
    await expect.element(combobox()).toHaveTextContent(text);
  });

  it("omits a disabled Dropdown from pointer and keyboard focus", async () => {
    await renderWithSalt(
      <>
        <button type="button">Before</button>
        <Disabled />
        <button type="button">After</button>
      </>,
    );
    await expect.element(combobox()).toBeDisabled();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Before" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "After" }))
      .toHaveFocus();
    await combobox().click({ force: true });
    await expect.element(combobox()).not.toHaveFocus();
    await expect.element(listbox()).not.toBeInTheDocument();
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
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expectActive("Alabama");
    await userEvent.keyboard("{Enter}");
    await expect.element(combobox()).toBeDisabled();
    await expect.element(combobox()).not.toHaveFocus();
  });

  it("does not select a disabled option", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <DisabledOption onSelectionChange={onSelectionChange} />,
    );
    await combobox().click();
    const california = page.getByRole("option", { name: "California" });
    await expect.element(california).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("California{Enter}");
    await california.click({ force: true });
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
        await combobox().click();
        await page.getByRole("option", { name: "Alabama" }).click();
        await page.getByRole("option", { name: "Alaska" }).click();
      } else {
        await userEvent.tab();
        await userEvent.keyboard("{ArrowDown}");
        await expectActive("Alabama");
        await userEvent.keyboard(" ");
        await expect
          .element(page.getByRole("option", { name: "Alabama" }))
          .toHaveAttribute("aria-selected", "true");
        await userEvent.keyboard("{ArrowDown}");
        await expectActive("Alaska");
        await userEvent.keyboard("{Enter}");
      }
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual([
        "Alabama",
        "Alaska",
      ]);
      await expect
        .element(listbox())
        .toHaveAttribute("aria-multiselectable", "true");
      for (const name of ["Alabama", "Alaska"]) {
        await expect
          .element(page.getByRole("option", { name }))
          .toHaveAttribute("aria-selected", "true");
      }
      await expect.element(combobox()).toHaveTextContent("Alabama, Alaska");
    },
  );

  it("supports FormField labels and descriptions", async () => {
    await renderWithSalt(<WithFormField />);
    await expect.element(combobox()).toHaveAccessibleName("State");
    await expect
      .element(combobox())
      .toHaveAccessibleDescription("Pick a US state");
    await page.getByText("State", { exact: true }).click();
    await expect.element(combobox()).toHaveFocus();
    await expect.element(listbox()).toBeInTheDocument();
  });

  it("supports grouped options", async () => {
    await renderWithSalt(<Grouped />);
    await combobox().click();
    const group = page.getByRole("group", { name: "US" });
    await expect.element(group).toBeInTheDocument();
    await expect
      .element(group.getByRole("option", { name: "New York" }))
      .toBeInTheDocument();
  });

  it("supports complex options", async () => {
    await renderWithSalt(<ComplexOption />);
    await combobox().click();
    await page.getByRole("option", { name: "Read Read only" }).click();
    await expect.element(combobox()).toHaveTextContent("Read");
  });

  it("supports object values", async () => {
    await renderWithSalt(<ObjectValue />);
    await combobox().click();
    await userEvent.keyboard("Jane");
    const jane = page.getByRole("option", { name: "Jane Doe" });
    await jane.click();
    await expect
      .element(page.getByRole("option", { name: "Jane Doe" }))
      .toHaveAttribute("aria-selected", "true");
    await expect.element(combobox()).toHaveTextContent("Jane Doe");
  });

  it("supports a controlled value", async () => {
    await renderWithSalt(<CustomValue />);
    await combobox().click();
    await page.getByRole("option", { name: "Alabama" }).click();
    await expect.element(combobox()).toHaveTextContent("Alabama");
    await page.getByRole("option", { name: "Alaska" }).click();
    await expect.element(combobox()).toHaveTextContent("2 items selected");
  });

  it("respects default selection and permits replacement", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <WithDefaultSelected onSelectionChange={onSelectionChange} />,
    );
    await expect.element(combobox()).toHaveTextContent("California");
    await combobox().click();
    await expect
      .element(page.getByRole("option", { name: "California" }))
      .toHaveAttribute("aria-selected", "true");
    await page.getByRole("option", { name: "Alabama" }).click();
    await expect.element(combobox()).toHaveTextContent("Alabama");
    expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alabama"]);
  });

  it("supports required state", async () => {
    await renderWithSalt(<Default required />);
    await expect.element(combobox()).toHaveAttribute("aria-required", "true");
  });

  it.each([
    ["default", false],
    ["controlled", true],
  ] as const)("supports %s open state", async (mode, staysOpen) => {
    await renderWithSalt(
      mode === "default" ? <Default defaultOpen /> : <Default open />,
    );
    await expect.element(listbox()).toBeInTheDocument();
    await combobox().click();
    if (staysOpen) await expect.element(listbox()).toBeInTheDocument();
    else await expect.element(listbox()).not.toBeInTheDocument();
  });

  it("does not render a list without options", async () => {
    await renderWithSalt(<Dropdown open />);
    await expect.element(listbox()).not.toBeInTheDocument();
  });

  it("shows a placeholder for an empty value", async () => {
    await renderWithSalt(<Dropdown placeholder="Placeholder" value="" />);
    await expect.element(combobox()).toHaveTextContent("Placeholder");
  });

  it("supports typeahead", async () => {
    await withFakeTimers(
      () => renderWithSalt(<Default />),
      async () => {
        await userEvent.tab();
        for (const [keys, name] of [
          ["A", "Alabama"],
          ["A", "Alaska"],
          ["A", "Arizona"],
        ] as const) {
          await userEvent.keyboard(keys);
          await expectActive(name);
        }
        await vi.advanceTimersByTimeAsync(CORE_TYPEAHEAD_RESET_MS + 1);
        await userEvent.keyboard("Co");
        await expectActive("Connecticut");
        await vi.advanceTimersByTimeAsync(CORE_TYPEAHEAD_RESET_MS + 1);
      },
    );
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

  it("does not blur when selecting from the list", async () => {
    const onBlur = vi.fn();
    await renderWithSalt(<Default onBlur={onBlur} />);
    await combobox().click();
    await page.getByRole("option").nth(0).click();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("removes active descendant whenever the popup closes", async () => {
    await renderWithSalt(<Default />);
    await combobox().click();
    await page.getByRole("option", { name: "Alaska" }).click();
    await expect
      .element(combobox())
      .not.toHaveAttribute("aria-activedescendant");
    await combobox().click();
    await expectActive("Alaska");
    await page.getByRole("option", { name: "Alabama" }).click();
    await expect
      .element(combobox())
      .not.toHaveAttribute("aria-activedescendant");
    await combobox().click();
    await expectActive("Alabama");
    await userEvent.keyboard("{Escape}");
    await expect
      .element(combobox())
      .not.toHaveAttribute("aria-activedescendant");
  });

  it("permits focus to move from keydown capture", async () => {
    function TestSetup() {
      const buttonRef = useRef<HTMLButtonElement>(null);
      const moveFocus: KeyboardEventHandler = (event) => {
        if (event.key === "ArrowRight") buttonRef.current?.focus();
      };
      return (
        <>
          <Dropdown onKeyDownCapture={moveFocus}>
            <Option value={1}>1</Option>
          </Dropdown>
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

  it("forwards OverlayProps", async () => {
    await renderWithSalt(
      <Default OverlayProps={{ "data-testid": "overlay" }} open />,
    );
    await expect
      .element(page.getByTestId("overlay"))
      .toHaveAttribute("role", "listbox");
  });

  it("uses its own validation status", async () => {
    await renderWithSalt(
      <Dropdown validationStatus="warning">
        <Option value={1}>1</Option>
      </Dropdown>,
    );
    await expect.element(combobox()).toHaveClass("saltDropdown-warning");
  });

  it("prioritizes FormField validation status", async () => {
    await renderWithSalt(
      <FormField validationStatus="error">
        <FormFieldLabel>Field</FormFieldLabel>
        <Dropdown validationStatus="warning">
          <Option value={1}>1</Option>
        </Dropdown>
      </FormField>,
    );
    await expect.element(combobox()).toHaveClass("saltDropdown-error");
    await expect.element(combobox()).not.toHaveClass("saltDropdown-warning");
  });

  it("opens a 10000-item list", async () => {
    await renderWithSalt(<PerformanceTest />);
    await combobox().click();
    await expect.element(listbox()).toBeVisible();
    expect(document.querySelectorAll(".saltOption")).toHaveLength(10_000);
  });

  it("supports 1000 non-virtualized options through focus, mouse/keyboard open, navigation, and close", async () => {
    await renderWithSalt(<PerformanceTestOneThousand />);
    combobox().element().focus();
    await expect.element(combobox()).toHaveFocus();
    await expect.element(combobox()).toHaveAttribute("aria-expanded", "false");
    await expect.element(collapsedList()).not.toBeVisible();
    expect(document.querySelectorAll(".saltOption")).toHaveLength(1_000);

    await combobox().click();
    await expect
      .poll(() => document.querySelectorAll(".saltOption").length, {
        timeout: 30_000,
      })
      .toBe(1_000);
    await page
      .elementLocator(document.body)
      .click({ position: { x: 0, y: 0 } });
    await expect.element(listbox()).not.toBeInTheDocument();

    combobox().element().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .poll(() => document.querySelectorAll(".saltOption").length, {
        timeout: 30_000,
      })
      .toBe(1_000);
    await expectActive(0);
    await userEvent.keyboard("{ArrowDown}");
    await expectActive(1);

    await page
      .elementLocator(document.body)
      .click({ position: { x: 0, y: 0 } });
    await expect.element(combobox()).toHaveAttribute("aria-expanded", "false");
    await expect.element(listbox()).not.toBeInTheDocument();
  });
});

describe("GIVEN a Dropdown at the edge of its options", () => {
  it("stops the page scrolling when opening the list with an arrow key", async () => {
    const keyDown = trackDefaultPrevented();
    await renderWithSalt(
      <Dropdown onKeyDown={keyDown.handler}>
        <Option value="Alabama" />
        <Option value="Alaska" />
      </Dropdown>,
    );

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");

    await expect.element(listbox()).toBeInTheDocument();
    expect(keyDown.lastDefaultPrevented()).toBe(true);
  });

  it("stops the page scrolling when arrowing past the first option", async () => {
    const keyDown = trackDefaultPrevented();
    await renderWithSalt(
      <Dropdown onKeyDown={keyDown.handler}>
        <Option value="Alabama" />
        <Option value="Alaska" />
      </Dropdown>,
    );

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Home}");

    // The active option cannot move, but the dropdown still owns the key.
    await userEvent.keyboard("{ArrowUp}");

    expect(keyDown.lastDefaultPrevented()).toBe(true);
  });
});

describe("GIVEN a closed Dropdown", () => {
  it.each([
    ["{Home}", "Alabama"],
    ["{End}", "Arizona"],
  ] as const)(
    "opens the list with %s and moves focus to %s",
    async (key, activeOption) => {
      const keyDown = trackDefaultPrevented();
      await renderWithSalt(
        <Dropdown onKeyDown={keyDown.handler}>
          <Option value="Alabama" />
          <Option value="Alaska" />
          <Option value="Arizona" />
        </Dropdown>,
      );
      await userEvent.tab();
      await expect
        .element(combobox())
        .toHaveAttribute("aria-expanded", "false");

      await userEvent.keyboard(key);

      expect(keyDown.lastDefaultPrevented()).toBe(true);
      await expect.element(listbox()).toBeInTheDocument();
      await expectActive(activeOption);
    },
  );

  it.each([
    ["{Home}", "Alabama"],
    ["{End}", "Arizona"],
  ] as const)(
    "uses %s to move focus to %s even when another option is selected",
    async (key, activeOption) => {
      await renderWithSalt(
        <Dropdown defaultSelected={["Alaska"]}>
          <Option value="Alabama" />
          <Option value="Alaska" />
          <Option value="Arizona" />
        </Dropdown>,
      );
      await userEvent.tab();

      await userEvent.keyboard(key);

      await expect.element(listbox()).toBeInTheDocument();
      await expectActive(activeOption);
    },
  );

  it("still opens on the selected option with an arrow key", async () => {
    await renderWithSalt(
      <Dropdown defaultSelected={["Alaska"]}>
        <Option value="Alabama" />
        <Option value="Alaska" />
        <Option value="Arizona" />
      </Dropdown>,
    );
    await userEvent.tab();

    await userEvent.keyboard("{ArrowDown}");

    await expect.element(listbox()).toBeInTheDocument();
    await expectActive("Alaska");
  });

  it.each(["{PageUp}", "{PageDown}"])(
    "lets %s scroll the page",
    async (key) => {
      const keyDown = trackDefaultPrevented();
      await renderWithSalt(
        <Dropdown onKeyDown={keyDown.handler}>
          <Option value="Alabama" />
          <Option value="Alaska" />
        </Dropdown>,
      );
      await userEvent.tab();
      await expect
        .element(combobox())
        .toHaveAttribute("aria-expanded", "false");

      await userEvent.keyboard(key);

      expect(keyDown.lastDefaultPrevented()).toBe(false);
      await expect
        .element(combobox())
        .toHaveAttribute("aria-expanded", "false");
      await expect
        .element(combobox())
        .not.toHaveAttribute("aria-activedescendant");
    },
  );
});

describe("GIVEN an open Dropdown with focus on the first option", () => {
  function States({ selected }: { selected?: string[] }) {
    return (
      <Dropdown defaultSelected={selected}>
        <Option value="Alabama" />
        <Option value="Alaska" />
        <Option value="Arizona" />
      </Dropdown>
    );
  }

  it("keeps focus on the first option when re-rendered with a selection", async () => {
    const { rerender } = await renderWithSalt(<States selected={["Alaska"]} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expectActive("Alaska");
    await userEvent.keyboard("{Home}");
    await expectActive("Alabama");

    await rerender(<States selected={["Alaska"]} />);

    await expectActive("Alabama");
  });

  it("keeps focus on the first option when re-rendered after opening with End", async () => {
    const { rerender } = await renderWithSalt(<States />);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expectActive("Arizona");
    await userEvent.keyboard("{Home}");
    await expectActive("Alabama");

    await rerender(<States />);

    await expectActive("Alabama");
  });

  it("keeps a typeahead match on the first option when opening", async () => {
    await renderWithSalt(<States selected={["Arizona"]} />);
    await userEvent.tab();

    await userEvent.keyboard("a");

    await expect.element(listbox()).toBeInTheDocument();
    await expectActive("Alabama");
  });
});

describe("GIVEN a Dropdown and a navigation key pressed with a modifier", () => {
  function States({ onKeyDown }: { onKeyDown: KeyboardEventHandler }) {
    return (
      <Dropdown onKeyDown={onKeyDown}>
        <Option value="Alabama" />
        <Option value="Alaska" />
      </Dropdown>
    );
  }

  it.each([
    "{Control>}{Home}{/Control}",
    "{Control>}{End}{/Control}",
    "{Meta>}{ArrowDown}{/Meta}",
    "{Alt>}{End}{/Alt}",
  ])("does not open the list with %s", async (keys) => {
    const keyDown = trackDefaultPrevented();
    await renderWithSalt(<States onKeyDown={keyDown.handler} />);
    await userEvent.tab();

    await userEvent.keyboard(keys);

    expect(keyDown.lastDefaultPrevented()).toBe(false);
    await expect.element(combobox()).toHaveAttribute("aria-expanded", "false");
  });

  it("still opens the list with Alt+ArrowDown", async () => {
    const keyDown = trackDefaultPrevented();
    await renderWithSalt(<States onKeyDown={keyDown.handler} />);
    await userEvent.tab();

    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");

    expect(keyDown.lastDefaultPrevented()).toBe(true);
    await expect.element(listbox()).toBeInTheDocument();
    await expectActive("Alabama");
  });

  it("leaves Ctrl+PageDown to the browser while the list is open", async () => {
    const keyDown = trackDefaultPrevented();
    await renderWithSalt(<States onKeyDown={keyDown.handler} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expectActive("Alabama");

    await userEvent.keyboard("{Control>}{PageDown}{/Control}");

    expect(keyDown.lastDefaultPrevented()).toBe(false);
    await expectActive("Alabama");
  });
});
