import {
  FormField,
  FormFieldLabel,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as radioButtonStories from "~stories/radio-button/radio-button.stories";

const composedStories = composeStories(radioButtonStories);

describe("GIVEN a RadioButtonGroup", () => {
  checkAccessibility(composedStories);

  it("renders its radio children", async () => {
    await renderWithSalt(
      <RadioButtonGroup value="button one">
        {["button one", "button two", "button three"].map((value) => (
          <RadioButton key={value} label={value} value={value} />
        ))}
      </RadioButtonGroup>,
    );
    await expect.element(page.getByRole("radio")).toHaveLength(3);
  });

  it("supports horizontal layout", async () => {
    await renderWithSalt(
      <RadioButtonGroup direction="horizontal">
        <RadioButton label="Spot" value="spot" />
        <RadioButton label="Forward" value="forward" />
      </RadioButtonGroup>,
    );
    const group = document.querySelector<HTMLElement>(
      ".saltRadioButtonGroup-horizontal",
    );
    expect(group).not.toBeNull();
    expect(getComputedStyle(group as HTMLElement).flexDirection).toBe("row");
  });

  it("supports an uncontrolled default value", async () => {
    await renderWithSalt(
      <RadioButtonGroup
        aria-label="Uncontrolled Example"
        defaultValue="forward"
      >
        <RadioButton label="Spot" value="spot" />
        <RadioButton label="Forward" value="forward" />
      </RadioButtonGroup>,
    );
    await expect
      .element(page.getByRole("radio", { name: "Forward" }))
      .toBeChecked();
  });

  it("selects uncontrolled options and calls onChange", async () => {
    const values: string[] = [];
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => {
      values.push(event.target.value);
    });
    await renderWithSalt(
      <RadioButtonGroup onChange={onChange}>
        <RadioButton label="Spot" value="spot" />
        <RadioButton label="Forward" value="forward" />
      </RadioButtonGroup>,
    );
    const spot = page.getByRole("radio", { name: "Spot" });
    const forward = page.getByRole("radio", { name: "Forward" });

    await expect.element(spot).not.toBeChecked();
    await expect.element(forward).not.toBeChecked();
    await forward.click();
    await expect.element(spot).not.toBeChecked();
    await expect.element(forward).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
    expect(values).toEqual(["forward"]);

    await spot.click();
    await expect.element(spot).toBeChecked();
    await expect.element(forward).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(values).toEqual(["forward", "spot"]);
  });

  it("inherits disabled state from FormField", async () => {
    await renderWithSalt(
      <FormField disabled>
        <FormFieldLabel>Label</FormFieldLabel>
        <RadioButtonGroup>
          <RadioButton label="Spot" value="spot" />
          <RadioButton label="Forward" value="forward" />
        </RadioButtonGroup>
      </FormField>,
    );
    const radios = page.getByRole("radio");
    await expect.element(radios.nth(0)).toBeDisabled();
    await expect.element(radios.nth(1)).toBeDisabled();
  });

  it("inherits read-only state from FormField", async () => {
    await renderWithSalt(
      <FormField readOnly>
        <FormFieldLabel>Label</FormFieldLabel>
        <RadioButtonGroup>
          <RadioButton label="Spot" value="spot" />
          <RadioButton label="Forward" value="forward" />
        </RadioButtonGroup>
      </FormField>,
    );
    const radios = page.getByRole("radio");
    await expect.element(radios.nth(0)).toHaveAttribute("readonly");
    await expect.element(radios.nth(1)).toHaveAttribute("readonly");
  });

  it("preserves each radio's accessible name in FormField", async () => {
    await renderWithSalt(
      <FormField>
        <FormFieldLabel>Label</FormFieldLabel>
        <RadioButtonGroup>
          <RadioButton label="Spot" value="spot" />
          <RadioButton label="Forward" value="forward" />
        </RadioButtonGroup>
      </FormField>,
    );
    await expect
      .element(page.getByRole("radio").nth(0))
      .toHaveAccessibleName("Spot");
  });
});
