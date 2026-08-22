import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as comboBoxStories from "~stories/combobox/combobox.stories";
import { renderWithSalt } from "../render";

const { Default, WithInitialSelection, WithFormField } =
  composeStories(comboBoxStories);

const comboBox = () => page.getByRole("combobox");

describe("A lab combo box", () => {
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

    it("assigns aria-activedescendant only on focus", async () => {
      await renderWithSalt(<WithInitialSelection id={mockId} />);
      await expect
        .element(comboBox())
        .not.toHaveAttribute("aria-activedescendant");

      await userEvent.tab();
      await expect
        .element(comboBox())
        .toHaveAttribute("aria-activedescendant", `${mockId}-item-3`);
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
            `${mockId}-item-${itemIndex}`,
          );
      },
    );
  });

  it("inherits aria-required from FormField", async () => {
    await renderWithSalt(<WithFormField required />);
    await expect.element(comboBox()).toHaveAttribute("aria-required", "true");
  });
});
