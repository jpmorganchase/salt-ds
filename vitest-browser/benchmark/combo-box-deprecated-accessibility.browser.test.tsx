import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as comboBoxStories from "~stories/combobox/combobox-deprecated.stories";
import { renderWithSalt } from "../render";

const {
  Default,
  MultiSelectWithInitialSelection,
  MultiSelectWithFormField,
  WithInitialSelection,
  WithFormField,
  MultiSelect,
  MultiSelectWithFormFieldWithInitialSelection,
} = composeStories(comboBoxStories);

const comboBox = () => page.getByRole("combobox");
const textbox = () => page.getByRole("textbox");

describe("A deprecated combo box", () => {
  it("assigns the combobox role to the input", async () => {
    await renderWithSalt(
      <Default
        InputProps={{ inputProps: { "data-testid": "my-input" } as never }}
      />,
    );
    await expect
      .element(page.getByTestId("my-input"))
      .toHaveAttribute("role", "combobox");
  });

  it("reports its expanded state", async () => {
    await renderWithSalt(<Default />);
    await expect.element(comboBox()).toHaveAttribute("aria-expanded", "false");
    await comboBox().click();
    await expect.element(comboBox()).toHaveAttribute("aria-expanded", "true");
  });

  describe("when navigating with the keyboard", () => {
    const mockId = "my-combo-box";

    it.skip("assigns aria-activedescendant only on focus", async () => {
      await renderWithSalt(<WithInitialSelection id={mockId} />);
      await expect
        .element(comboBox())
        .not.toHaveAttribute("aria-activedescendant");
      await userEvent.tab();
      await expect
        .element(comboBox())
        .toHaveAttribute("aria-activedescendant", `${mockId}-list-item-0`);
    });

    it("removes aria-activedescendant when navigating through the input", async () => {
      await renderWithSalt(<Default />);
      await userEvent.tab();
      await userEvent.keyboard("A{ArrowDown}");
      await expect.element(comboBox()).toHaveAttribute("aria-activedescendant");
      await userEvent.keyboard("{ArrowLeft}");
      await expect
        .element(comboBox())
        .not.toHaveAttribute("aria-activedescendant");
    });

    it.each([
      ["ArrowUp", "0"],
      ["ArrowDown", "1"],
    ])(
      "re-attaches aria-activedescendant when navigating the list with %s",
      async (key, itemIndex) => {
        await renderWithSalt(<Default id={mockId} />);
        await userEvent.tab();
        await userEvent.keyboard("A{ArrowDown}{ArrowLeft}");
        await expect
          .element(comboBox())
          .not.toHaveAttribute("aria-activedescendant");
        await userEvent.keyboard(`{${key}}`);
        await expect
          .element(comboBox())
          .toHaveAttribute(
            "aria-activedescendant",
            `${mockId}-list-item-${itemIndex}`,
          );
      },
    );
  });

  it("inherits aria-required from FormField", async () => {
    await renderWithSalt(<WithFormField required />);
    await expect.element(comboBox()).toHaveAttribute("aria-required", "true");
  });
});

describe("A deprecated multi-select combo box", () => {
  it("assigns the textbox role and role description to the input", async () => {
    await renderWithSalt(
      <MultiSelect
        InputProps={{
          InputProps: {
            inputProps: { "data-testid": "my-input" } as never,
          },
        }}
      />,
    );
    const input = page.getByTestId("my-input");
    await expect.element(input).toHaveAttribute("role", "textbox");
    await expect
      .element(input)
      .toHaveAttribute("aria-roledescription", "MultiSelect Combobox");
  });

  it("assigns a role description to the expand button", async () => {
    await renderWithSalt(<MultiSelectWithInitialSelection />);
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-roledescription", "Expand combobox button");
  });

  describe("when navigating with the keyboard", () => {
    const mockId = "my-combo-box";

    it.skip("has no aria-activedescendant on focus", async () => {
      await renderWithSalt(<MultiSelectWithInitialSelection />);
      await userEvent.tab();
      await expect
        .element(textbox())
        .not.toHaveAttribute("aria-activedescendant");
    });

    it("attaches the correct aria-activedescendant when navigating list and pills", async () => {
      await renderWithSalt(<MultiSelectWithInitialSelection id={mockId} />);
      await userEvent.tab();
      await userEvent.keyboard("A{ArrowDown}");
      await expect
        .element(textbox())
        .toHaveAttribute("aria-activedescendant", `${mockId}-list-item-1`);
      await userEvent.keyboard("{Home}{ArrowLeft}");
      await expect
        .element(textbox())
        .toHaveAttribute("aria-activedescendant", `${mockId}-input-pill-4`);
    });

    it("re-attaches aria-activedescendant when navigating through pills", async () => {
      await renderWithSalt(<MultiSelectWithInitialSelection id={mockId} />);
      await userEvent.tab();
      await userEvent.keyboard("A{Home}{ArrowLeft}");
      await expect
        .element(textbox())
        .toHaveAttribute("aria-activedescendant", `${mockId}-input-pill-4`);
      await userEvent.keyboard("{ArrowRight}");
      await expect
        .element(textbox())
        .not.toHaveAttribute("aria-activedescendant");
      await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
      await expect
        .element(textbox())
        .toHaveAttribute("aria-activedescendant", `${mockId}-input-pill-4`);
    });

    it.each(["ArrowUp", "ArrowDown"])(
      "re-enters list navigation from pills with %s",
      async (key) => {
        await renderWithSalt(<MultiSelectWithInitialSelection id={mockId} />);
        await userEvent.tab();
        await userEvent.keyboard("A{ArrowDown}{Home}{ArrowLeft}");
        await expect
          .element(textbox())
          .toHaveAttribute("aria-activedescendant", `${mockId}-input-pill-4`);
        await userEvent.keyboard(`{${key}}`);
        await expect.element(textbox()).toBeInTheDocument();
      },
    );
  });

  it("inherits aria-required from FormField", async () => {
    await renderWithSalt(<MultiSelectWithFormField required />);
    await expect.element(textbox()).toHaveAttribute("aria-required", "true");
  });

  it.skip("assigns aria-labelledby to the input and list", async () => {
    const mockId = "my-combo-box";
    const mockInputId = `${mockId}-input-input`;
    const mockLabelId = `${mockId}-input-label`;
    await renderWithSalt(
      <MultiSelectWithFormFieldWithInitialSelection
        id={mockId}
        LabelProps={{ id: mockLabelId }}
      />,
    );
    await userEvent.tab();
    await expect.element(textbox()).toHaveAttribute("aria-label", "5 items");
    await expect
      .element(textbox())
      .toHaveAttribute("aria-labelledby", `${mockLabelId} ${mockInputId}`);
  });

  it("assigns aria-labelledby to the expand button", async () => {
    const mockId = "my-combo-box";
    const mockInputId = `${mockId}-input-input`;
    const mockLabelId = `${mockId}-input-label`;
    await renderWithSalt(
      <MultiSelectWithFormFieldWithInitialSelection
        id={mockId}
        LabelProps={{ id: mockLabelId }}
      />,
    );
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-labelledby", `${mockLabelId} ${mockInputId}`);
  });
});
