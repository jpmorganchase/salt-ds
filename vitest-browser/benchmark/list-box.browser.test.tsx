import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as listBoxStories from "~stories/list-box/list-box.stories";
import { renderWithSalt } from "../render";

const {
  SingleSelect,
  Multiselect,
  Disabled,
  DisabledOption,
  DefaultSelectedSingleSelect,
  DefaultSelectedMultiselect,
  Grouped,
  Scrolling,
} = composeStories(listBoxStories);

async function expectActiveOption(nameOrIndex: string | number) {
  const option =
    typeof nameOrIndex === "number"
      ? page.getByRole("option").nth(nameOrIndex)
      : page.getByRole("option", { name: nameOrIndex });
  const optionId = (await option.element()).id;
  await expect
    .element(page.getByRole("listbox"))
    .toHaveAttribute("aria-activedescendant", optionId);
}

describe("GIVEN a List box", () => {
  it("allows selection with a mouse", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <SingleSelect onSelectionChange={onSelectionChange} />,
    );

    const alaska = page.getByRole("option", { name: "Alaska" });
    await alaska.hover();
    await alaska.click();
    await expectActiveOption("Alaska");
    await expect.element(page.getByRole("listbox")).toHaveFocus();
    expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alaska"]);
  });

  it("allows selection with a keyboard", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <SingleSelect onSelectionChange={onSelectionChange} />,
    );

    await userEvent.tab();
    await expectActiveOption("Alabama");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expectActiveOption("Alaska");
    await expect.element(page.getByRole("listbox")).toHaveFocus();
    expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alaska"]);
  });

  it("does not select another option on mouse down", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <SingleSelect onSelectionChange={onSelectionChange} />,
    );
    const alaska = await page.getByRole("option", { name: "Alaska" }).element();

    alaska.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        button: 0,
        pointerType: "mouse",
      }),
    );
    alaska.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(onSelectionChange).not.toHaveBeenCalled();
    await expect
      .element(page.getByRole("listbox"))
      .not.toHaveAttribute(
        "aria-activedescendant",
        (await page.getByRole("option").nth(0).element()).id,
      );
  });

  it.each([
    ["single select", DefaultSelectedSingleSelect],
    ["multiselect", DefaultSelectedMultiselect],
  ] as const)("focuses the selected item in %s", async (_name, Story) => {
    await renderWithSalt(<Story />);
    await userEvent.tab();
    await expectActiveOption("Arkansas");
  });

  it("supports keyboard navigation without wrapping", async () => {
    await renderWithSalt(<Scrolling />);
    await userEvent.tab();
    await expectActiveOption(0);

    await userEvent.keyboard("{ArrowUp}");
    await expectActiveOption(0);
    await userEvent.keyboard("{ArrowDown}");
    await expectActiveOption(1);
    await userEvent.keyboard("{PageDown}");
    await expectActiveOption(8);
    await userEvent.keyboard("{PageUp}");
    await expectActiveOption(1);
    await userEvent.keyboard("{End}");
    await expectActiveOption(-1);
    await userEvent.keyboard("{ArrowDown}");
    await expectActiveOption(-1);
    await userEvent.keyboard("{ArrowUp}");
    await expectActiveOption(-2);
    await userEvent.keyboard("{Home}");
    await expectActiveOption(0);
  });

  it("does not receive focus when disabled", async () => {
    await renderWithSalt(
      <div>
        <button type="button">start</button>
        <Disabled />
        <button type="button">end</button>
      </div>,
    );
    await expect
      .element(page.getByRole("listbox"))
      .toHaveAttribute("aria-disabled", "true");
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "start" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("listbox")).not.toHaveFocus();
    await expect
      .element(page.getByRole("button", { name: "end" }))
      .toHaveFocus();
  });

  it("does not select a disabled option", async () => {
    const onSelectionChange = vi.fn();
    await renderWithSalt(
      <DisabledOption onSelectionChange={onSelectionChange} />,
    );
    const arizona = page.getByRole("option", { name: "Arizona" });
    await expect.element(arizona).toHaveAttribute("aria-disabled", "true");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expectActiveOption("Arizona");
    expect(onSelectionChange).not.toHaveBeenCalled();
    await arizona.click({ force: true });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it.each(["mouse", "keyboard"])(
    "allows multiple selection with a %s",
    async (interaction) => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <Multiselect onSelectionChange={onSelectionChange} />,
      );
      const listbox = page.getByRole("listbox");
      const alabama = page.getByRole("option", { name: "Alabama" });
      const alaska = page.getByRole("option", { name: "Alaska" });
      await expect
        .element(listbox)
        .toHaveAttribute("aria-multiselectable", "true");

      if (interaction === "mouse") {
        await alabama.click();
        await alaska.click();
      } else {
        await userEvent.tab();
        await userEvent.keyboard("{Enter}{ArrowDown}{Enter}");
      }

      await expect.element(alabama).toHaveAttribute("aria-selected", "true");
      await expect.element(alaska).toHaveAttribute("aria-selected", "true");
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual([
        "Alabama",
        "Alaska",
      ]);
    },
  );

  it("supports grouping", async () => {
    await renderWithSalt(<Grouped />);
    await expect
      .element(page.getByRole("group", { name: "A" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("option", { name: "Alabama" }))
      .toBeInTheDocument();
  });

  it("supports typeahead", async () => {
    await renderWithSalt(<SingleSelect />);
    await userEvent.tab();
    await userEvent.keyboard("A");
    await expectActiveOption("Alaska");
    await userEvent.keyboard("A");
    await expectActiveOption("Arizona");
    await new Promise((resolve) => setTimeout(resolve, 500));
    await userEvent.keyboard("Alas");
    await expectActiveOption("Alaska");
  });
});
