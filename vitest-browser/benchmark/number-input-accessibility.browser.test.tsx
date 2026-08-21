import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as numberInputStories from "~stories/number-input/number-input.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(numberInputStories);
const { Default } = composedStories;

describe("Number Input - Accessibility", () => {
  checkAccessibility(composedStories);

  it("sets the default ARIA attributes on the input", async () => {
    await renderWithSalt(
      <Default
        decimalScale={2}
        defaultValue={-20.1}
        max={250.23}
        min={-500.11}
      />,
    );
    const input = page.getByRole("spinbutton");

    await expect.element(input).toHaveValue("-20.10");
    await expect.element(input).toHaveAttribute("aria-valuemax", "250.23");
    await expect.element(input).toHaveAttribute("aria-valuemin", "-500.11");
    await expect.element(input).toHaveAttribute("aria-invalid", "false");
  });

  it("has the correct FormField labelling", async () => {
    await renderWithSalt(<Default defaultValue={-10} min={0} />);
    const input = page.getByRole("spinbutton");

    await expect.element(input).toHaveAccessibleName("Number input");
    await expect
      .element(input)
      .toHaveAccessibleDescription("Please enter a number");
  });

  it("sets aria-invalid when the value is out of range", async () => {
    await renderWithSalt(<Default defaultValue={-10} min={0} />);
    await expect
      .element(page.getByRole("spinbutton"))
      .toHaveAttribute("aria-invalid", "true");
  });

  it("sets the default ARIA attributes on increment buttons", async () => {
    await renderWithSalt(<Default />);

    for (const selector of [
      ".saltNumberInput-increment",
      ".saltNumberInput-decrement",
    ]) {
      const button = document.querySelector(selector);
      expect(button).toHaveAttribute("tabindex", "-1");
      expect(button).toHaveAttribute("aria-hidden", "true");
    }
  });
});
