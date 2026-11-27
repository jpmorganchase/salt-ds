import { ComboBox, type ComboBoxProps, Option } from "@salt-ds/core";
import { type ChangeEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import { usStateExampleData } from "~stories/assets/exampleData";

type Item = { id: string; value: string; disabled?: boolean };

const initialOptions: Item[] = [
  { id: "alpha", value: "Alpha" },
  { id: "beta", value: "Beta" },
];

const input = () => page.getByRole("combobox", { name: "Letters" });
const option = (name: string) => page.getByRole("option", { name });

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

// Holds the input value, as a typeahead that loads options for it would. Tests
// pass the options that each response renders as children.
function SearchComboBox({
  initialValue = "",
  ...props
}: ComboBoxProps & { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <ComboBox
      inputProps={{ "aria-label": "Letters" }}
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        setValue(event.target.value)
      }
      {...props}
    />
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

  it.each(["{Enter}", "{Tab}"])(
    "highlights the first option when typed results replace the highlighted one, and commits it with %s",
    async (key) => {
      const onSelectionChange = vi.fn();
      const { rerender } = await renderWithSalt(
        <SearchComboBox onSelectionChange={onSelectionChange}>
          {usStateExampleData.slice(0, 3).map((state) => (
            <Option key={state} value={state} />
          ))}
        </SearchComboBox>,
      );
      await input().click();
      await userEvent.keyboard("Alas");
      await expect
        .element(input())
        .toHaveAttribute(
          "aria-activedescendant",
          option("Alabama").element().id,
        );

      // The response recreates its options, so the highlighted one is removed.
      await rerender(
        <SearchComboBox onSelectionChange={onSelectionChange}>
          <Option key="response-Alaska" value="Alaska" />
        </SearchComboBox>,
      );
      await expect
        .element(input())
        .toHaveAttribute(
          "aria-activedescendant",
          option("Alaska").element().id,
        );
      await userEvent.keyboard(key);

      expect(onSelectionChange).toHaveBeenCalledOnce();
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alaska"]);
    },
  );

  it("highlights the first option when typed results arrive for an empty list", async () => {
    const { rerender } = await renderWithSalt(<SearchComboBox />);
    await input().click();
    await userEvent.keyboard("Ala");
    await expect.element(input()).not.toHaveAttribute("aria-activedescendant");

    await rerender(
      <SearchComboBox>
        {usStateExampleData.slice(0, 2).map((state) => (
          <Option key={state} value={state} />
        ))}
      </SearchComboBox>,
    );

    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alabama").element().id);
  });

  it.each(["{Enter}", "{Tab}"])(
    "highlights async results for uncontrolled text and commits with %s",
    async (key) => {
      const onSelectionChange = vi.fn();
      const comboBoxProps = {
        inputProps: { "aria-label": "Letters" },
        onSelectionChange,
      };
      const { rerender } = await renderWithSalt(
        <ComboBox {...comboBoxProps} />,
      );
      await input().click();
      await userEvent.keyboard("Ala");
      await expect.element(input()).toHaveValue("Ala");

      await rerender(
        <ComboBox {...comboBoxProps}>
          <Option key="Alaska" value="Alaska" />
        </ComboBox>,
      );
      await expect
        .element(input())
        .toHaveAttribute(
          "aria-activedescendant",
          option("Alaska").element().id,
        );
      await userEvent.keyboard(key);

      expect(onSelectionChange).toHaveBeenCalledOnce();
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alaska"]);
      await expect.element(input()).toHaveValue("Alaska");
    },
  );

  it("keeps the highlighted option when typed results still include it", async () => {
    const { rerender } = await renderWithSalt(
      <SearchComboBox>
        {usStateExampleData.slice(0, 3).map((state) => (
          <Option key={state} value={state} />
        ))}
      </SearchComboBox>,
    );
    await input().click();
    await userEvent.keyboard("A");
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alabama").element().id);

    await rerender(
      <SearchComboBox>
        {usStateExampleData
          .slice(0, 3)
          .reverse()
          .map((state) => (
            <Option key={state} value={state} />
          ))}
      </SearchComboBox>,
    );

    await expect
      .element(page.getByRole("option").first())
      .toHaveAccessibleName("Arizona");
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alabama").element().id);
  });

  it("keeps the option the user hovers when typed results still include it", async () => {
    const { rerender } = await renderWithSalt(
      <SearchComboBox>
        {usStateExampleData.slice(0, 3).map((state) => (
          <Option key={state} value={state} />
        ))}
      </SearchComboBox>,
    );
    await input().click();
    await userEvent.keyboard("A");
    await option("Alaska").hover();
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alaska").element().id);

    await rerender(
      <SearchComboBox>
        {usStateExampleData.slice(0, 4).map((state) => (
          <Option key={state} value={state} />
        ))}
      </SearchComboBox>,
    );

    await expect.element(option("Arkansas")).toBeInTheDocument();
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alaska").element().id);
  });

  it("does not highlight another option when typed results remove the one the user navigated to", async () => {
    const { rerender } = await renderWithSalt(
      <SearchComboBox>
        {usStateExampleData.slice(0, 3).map((state) => (
          <Option key={state} value={state} />
        ))}
      </SearchComboBox>,
    );
    await input().click();
    await userEvent.keyboard("A");
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alabama").element().id);
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alaska").element().id);

    await rerender(
      <SearchComboBox>
        <Option key="Alabama" value="Alabama" />
        <Option key="Arizona" value="Arizona" />
      </SearchComboBox>,
    );

    await expect.element(option("Alaska")).not.toBeInTheDocument();
    await expect.element(input()).not.toHaveAttribute("aria-activedescendant");
  });

  it("highlights and toggles the first typed result in a multiselect ComboBox", async () => {
    const onSelectionChange = vi.fn();
    const { rerender } = await renderWithSalt(
      <SearchComboBox multiselect onSelectionChange={onSelectionChange} />,
    );
    await input().click();
    await userEvent.keyboard("Alas");

    await rerender(
      <SearchComboBox multiselect onSelectionChange={onSelectionChange}>
        <Option key="Alaska" value="Alaska" />
      </SearchComboBox>,
    );
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alaska").element().id);
    await userEvent.keyboard("{Enter}");

    expect(onSelectionChange).toHaveBeenCalledOnce();
    expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alaska"]);
    await expect.element(page.getByRole("listbox")).toBeInTheDocument();
  });

  it("highlights the selected option when options load after opening with its text in the input", async () => {
    const { rerender } = await renderWithSalt(
      <SearchComboBox initialValue="Alaska" defaultSelected={["Alaska"]} />,
    );
    await input().click();

    await rerender(
      <SearchComboBox initialValue="Alaska" defaultSelected={["Alaska"]}>
        {usStateExampleData.slice(0, 3).map((state) => (
          <Option key={state} value={state} />
        ))}
      </SearchComboBox>,
    );

    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alaska").element().id);
  });

  it.each([true, false])(
    "waits for the selected option while a cached option is shown (controlled: %s)",
    async (controlled) => {
      const onSelectionChange = vi.fn();
      const TestComboBox = controlled ? SearchComboBox : ComboBox;
      const renderComboBox = (options: string[]) => (
        <TestComboBox
          {...(controlled ? { initialValue: "Alaska" } : {})}
          defaultSelected={["Alaska"]}
          inputProps={{ "aria-label": "Letters" }}
          onSelectionChange={onSelectionChange}
        >
          {options.map((state) => (
            <Option key={state} value={state} />
          ))}
        </TestComboBox>
      );
      const { rerender } = await renderWithSalt(renderComboBox(["Alabama"]));
      await input().click();
      await expect.element(option("Alabama")).toBeInTheDocument();
      await expect
        .element(input())
        .not.toHaveAttribute("aria-activedescendant");

      await rerender(renderComboBox(["Alabama", "Alaska"]));
      await expect
        .element(input())
        .toHaveAttribute(
          "aria-activedescendant",
          option("Alaska").element().id,
        );
      await userEvent.keyboard("{Enter}");

      expect(onSelectionChange).toHaveBeenCalledOnce();
      expect(onSelectionChange.mock.lastCall?.[1]).toEqual(["Alaska"]);
    },
  );

  it("highlights the first option once the user edits the selected option's text", async () => {
    await renderWithSalt(
      <SearchComboBox initialValue="Alaska" defaultSelected={["Alaska"]}>
        {usStateExampleData.slice(0, 3).map((state) => (
          <Option key={state} value={state} />
        ))}
      </SearchComboBox>,
    );
    await input().click();
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alaska").element().id);

    await userEvent.keyboard("{Backspace}");

    await expect.element(input()).toHaveValue("Alask");
    await expect
      .element(input())
      .toHaveAttribute("aria-activedescendant", option("Alabama").element().id);
  });
});
