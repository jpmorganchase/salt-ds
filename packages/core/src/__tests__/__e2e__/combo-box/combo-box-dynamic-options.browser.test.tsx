import { ComboBox, type ComboBoxProps, Option } from "@salt-ds/core";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

type Item = { id: string; value: string; disabled?: boolean };

const initialOptions: Item[] = [
  { id: "alpha", value: "Alpha" },
  { id: "beta", value: "Beta" },
];

const input = () => page.getByRole("combobox", { name: "Letters" });

function DynamicComboBox({
  options,
  ...props
}: ComboBoxProps & { options: Item[] }) {
  return (
    <>
      <button type="button">Before</button>
      <ComboBox open inputProps={{ "aria-label": "Letters" }} {...props}>
        {options.map(({ id, value, disabled }) => (
          <Option key={id} id={id} value={value} disabled={disabled} />
        ))}
      </ComboBox>
      <button type="button">After</button>
    </>
  );
}

async function activateFirstOption() {
  await input().click();
  await userEvent.keyboard("{ArrowDown}");
  await expect
    .element(input())
    .toHaveAttribute("aria-activedescendant", "alpha");
}

describe("ComboBox with changing options", () => {
  it.each(["{Enter}", "{Tab}"])(
    "does not commit a removed active option with %s",
    async (key) => {
      const onSelectionChange = vi.fn();
      const { rerender } = await renderWithSalt(
        <DynamicComboBox
          options={initialOptions}
          onSelectionChange={onSelectionChange}
        />,
      );
      await activateFirstOption();

      await rerender(
        <DynamicComboBox
          options={[initialOptions[1]]}
          onSelectionChange={onSelectionChange}
        />,
      );
      await userEvent.keyboard(key);

      expect(onSelectionChange).not.toHaveBeenCalled();
      await expect
        .element(input())
        .not.toHaveAttribute("aria-activedescendant");
    },
  );

  it("clears an active descendant when the entire option list disappears", async () => {
    const onSelectionChange = vi.fn();
    const { rerender } = await renderWithSalt(
      <DynamicComboBox
        options={initialOptions}
        onSelectionChange={onSelectionChange}
      />,
    );
    await activateFirstOption();

    await rerender(
      <DynamicComboBox options={[]} onSelectionChange={onSelectionChange} />,
    );

    await expect.element(input()).toHaveAttribute("aria-expanded", "false");
    await expect.element(input()).not.toHaveAttribute("aria-controls");
    await expect.element(input()).not.toHaveAttribute("aria-activedescendant");
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    await userEvent.keyboard("{Enter}{Tab}");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it.each(["{Enter}", "{Tab}"])(
    "does not commit an active option that becomes disabled with %s",
    async (key) => {
      const onSelectionChange = vi.fn();
      const { rerender } = await renderWithSalt(
        <DynamicComboBox
          options={initialOptions}
          onSelectionChange={onSelectionChange}
        />,
      );
      await activateFirstOption();

      await rerender(
        <DynamicComboBox
          options={[
            { ...initialOptions[0], disabled: true },
            initialOptions[1],
          ]}
          onSelectionChange={onSelectionChange}
        />,
      );
      await expect
        .element(page.getByRole("option", { name: "Alpha" }))
        .toHaveAttribute("aria-disabled", "true");
      await userEvent.keyboard(key);

      expect(onSelectionChange).not.toHaveBeenCalled();
    },
  );

  it("commits the current value when the active option's value changes", async () => {
    const onSelectionChange = vi.fn();
    const { rerender } = await renderWithSalt(
      <DynamicComboBox
        options={initialOptions}
        onSelectionChange={onSelectionChange}
      />,
    );
    await activateFirstOption();

    await rerender(
      <DynamicComboBox
        options={[
          { ...initialOptions[0], value: "Updated alpha" },
          initialOptions[1],
        ]}
        onSelectionChange={onSelectionChange}
      />,
    );
    await userEvent.keyboard("{Enter}");

    expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Updated alpha"]);
    await expect.element(input()).toHaveValue("Updated alpha");
  });

  it("preserves the active option's identity when options are reordered", async () => {
    const { rerender } = await renderWithSalt(
      <DynamicComboBox options={initialOptions} />,
    );
    await activateFirstOption();

    await rerender(
      <DynamicComboBox options={[initialOptions[1], initialOptions[0]]} />,
    );

    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", "alpha");
    await userEvent.keyboard("{ArrowUp}");
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", "beta");
  });

  it.each([
    ["{ArrowDown}", "beta"],
    ["{ArrowUp}", "gamma"],
  ])("recovers from a removed active option with %s", async (key, id) => {
    const options = [...initialOptions, { id: "gamma", value: "Gamma" }];
    const { rerender } = await renderWithSalt(
      <DynamicComboBox options={options} />,
    );
    await activateFirstOption();

    await rerender(<DynamicComboBox options={options.slice(1)} />);
    await expect.element(input()).not.toHaveAttribute("aria-activedescendant");
    await userEvent.keyboard(key);

    await expect.element(input()).toHaveAttribute("aria-activedescendant", id);
  });

  it.each([false, true])(
    "preserves committed selection when selected options disappear (multiselect=%s)",
    async (multiselect) => {
      const onSelectionChange = vi.fn();
      const props = {
        multiselect,
        defaultSelected: ["Alpha"],
        onSelectionChange,
      };
      const { rerender } = await renderWithSalt(
        <DynamicComboBox options={initialOptions} {...props} />,
      );
      await input().click();

      await rerender(<DynamicComboBox options={[]} {...props} />);

      if (multiselect) {
        await expect
          .element(page.getByRole("button", { name: "Remove Alpha" }))
          .toBeInTheDocument();
      } else {
        await expect.element(input()).toHaveValue("Alpha");
      }
      expect(onSelectionChange).not.toHaveBeenCalled();
    },
  );

  it("exposes a popup only when asynchronous options arrive", async () => {
    const { rerender } = await renderWithSalt(<DynamicComboBox options={[]} />);
    await expect.element(input()).toHaveAttribute("aria-expanded", "false");
    await expect.element(input()).not.toHaveAttribute("aria-controls");
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();

    await rerender(<DynamicComboBox options={initialOptions} />);

    await expect.element(input()).toHaveAttribute("aria-expanded", "true");
    await expect
      .element(input())
      .toHaveAttribute("aria-controls", page.getByRole("listbox").element().id);
    await activateFirstOption();
  });

  it("removes popup relationships when an open ComboBox becomes read-only", async () => {
    const { rerender } = await renderWithSalt(
      <DynamicComboBox options={initialOptions} />,
    );
    await activateFirstOption();

    await rerender(<DynamicComboBox options={initialOptions} readOnly />);

    const textbox = page.getByRole("textbox", { name: "Letters" });
    await expect.element(textbox).not.toHaveAttribute("aria-expanded");
    await expect.element(textbox).not.toHaveAttribute("aria-controls");
    await expect.element(textbox).not.toHaveAttribute("aria-activedescendant");
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
  });

  it.each([false, true])(
    "selectOnTab=false leaves selection unchanged when shift=%s",
    async (shift) => {
      const onSelectionChange = vi.fn();
      await renderWithSalt(
        <DynamicComboBox
          options={initialOptions}
          selectOnTab={false}
          onSelectionChange={onSelectionChange}
        />,
      );
      await activateFirstOption();

      await userEvent.tab({ shift });

      expect(onSelectionChange).not.toHaveBeenCalled();
      await expect
        .element(page.getByRole("button", { name: shift ? "Before" : "After" }))
        .toHaveFocus();
    },
  );
});
