import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  Tooltip,
  useFormFieldProps,
} from "@salt-ds/core";
import { forwardRef, memo } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const ContextOnlyInput = forwardRef<HTMLInputElement>(
  function ContextOnlyInput(_props, ref) {
    const { a11yProps } = useFormFieldProps();
    return <input {...a11yProps} ref={ref} />;
  },
);

const NativeTooltip = memo(function NativeTooltip() {
  return (
    <Tooltip content="Tooltip help" open>
      <input aria-label="Native input" />
    </Tooltip>
  );
});

describe("GIVEN a Tooltip describing a form control", () => {
  it("describes a FormField Input with the helper text once", async () => {
    await renderWithSalt(
      <FormField id="tooltip-field">
        <FormFieldLabel>Label</FormFieldLabel>
        <Tooltip content="Helper text" open>
          <Input />
        </Tooltip>
      </FormField>,
    );

    const input = page.getByRole("textbox");
    await expect.element(input).toHaveAccessibleDescription("Helper text");
    await expect
      .element(input)
      .toHaveAttribute("aria-describedby", "helperText-tooltip-field");
    await expect
      .element(page.getByText("Helper text"))
      .toHaveAttribute("id", "helperText-tooltip-field");
  });

  it("still describes native inputs that do not consume FormField context", async () => {
    await renderWithSalt(
      <FormField id="native-field">
        <Tooltip content="Helper text" open>
          <input aria-label="Native input" />
        </Tooltip>
      </FormField>,
    );

    const input = page.getByRole("textbox");
    await expect.element(input).toHaveAccessibleDescription("Helper text");
    await expect
      .element(input)
      .toHaveAttribute("aria-describedby", "helperText-native-field");
  });

  it("still describes custom controls that only consume FormField context", async () => {
    await renderWithSalt(
      <FormField id="custom-field">
        <FormFieldLabel>Custom control</FormFieldLabel>
        <Tooltip content="Helper text" open>
          <ContextOnlyInput />
        </Tooltip>
      </FormField>,
    );

    const input = page.getByRole("textbox");
    await expect.element(input).toHaveAccessibleName("Custom control");
    await expect.element(input).toHaveAccessibleDescription("Helper text");
    await expect
      .element(input)
      .toHaveAttribute("aria-describedby", "helperText-custom-field");
  });

  it("uses the tooltip description outside a FormField", async () => {
    await renderWithSalt(
      <Tooltip content="Helper text" open>
        <Input aria-label="Input" />
      </Tooltip>,
    );

    await expect
      .element(page.getByRole("textbox"))
      .toHaveAccessibleDescription("Helper text");
    const tooltip = await page.getByRole("tooltip").element();
    await expect
      .element(page.getByRole("textbox"))
      .toHaveAttribute("aria-describedby", tooltip.id);
  });

  it("preserves an explicit trigger description over the generated reference", async () => {
    await renderWithSalt(
      <FormField id="consumer-field">
        <span id="consumer-description">Consumer description</span>
        <Tooltip content="Helper text" open>
          <input
            aria-label="Native input"
            aria-describedby="consumer-description"
          />
        </Tooltip>
      </FormField>,
    );

    const input = page.getByRole("textbox");
    await expect
      .element(input)
      .toHaveAccessibleDescription("Consumer description");
    await expect
      .element(input)
      .toHaveAttribute("aria-describedby", "consumer-description");
  });

  it("keeps a native trigger associated with its tooltip when field helper text exists", async () => {
    await renderWithSalt(
      <FormField>
        <FormFieldHelperText>Field helper</FormFieldHelperText>
        <Tooltip content="Tooltip help" open>
          <input aria-label="Native input" />
        </Tooltip>
      </FormField>,
    );

    await expect
      .element(page.getByRole("textbox"))
      .toHaveAccessibleDescription("Tooltip help");
  });

  it("keeps distinct field helper and tooltip descriptions on a Salt input", async () => {
    await renderWithSalt(
      <FormField>
        <FormFieldHelperText>Field helper</FormFieldHelperText>
        <Tooltip content="Tooltip help" open>
          <Input aria-label="Input" />
        </Tooltip>
      </FormField>,
    );

    await expect
      .element(page.getByRole("textbox"))
      .toHaveAccessibleDescription("Field helper Tooltip help");
  });

  it("keeps its description when a sibling helper is added and removed", async () => {
    const content = (showHelper: boolean) => (
      <FormField>
        {showHelper && <FormFieldHelperText>Field helper</FormFieldHelperText>}
        <NativeTooltip />
      </FormField>
    );
    const { rerender } = await renderWithSalt(content(false));
    const input = page.getByRole("textbox");
    await expect.element(input).toHaveAccessibleDescription("Tooltip help");

    await rerender(content(true));
    await expect.element(input).toHaveAccessibleDescription("Tooltip help");

    await rerender(content(false));
    await expect.element(input).toHaveAccessibleDescription("Tooltip help");
  });

  it("keeps separate tooltip descriptions when another tooltip closes", async () => {
    const content = (firstOpen: boolean) => (
      <FormField>
        <Tooltip content="First tooltip" open={firstOpen}>
          <input aria-label="First" />
        </Tooltip>
        <Tooltip content="Second tooltip" open>
          <input aria-label="Second" />
        </Tooltip>
      </FormField>
    );
    const { rerender } = await renderWithSalt(content(true));

    await expect
      .element(page.getByRole("textbox", { name: "First" }))
      .toHaveAccessibleDescription("First tooltip");
    const secondInput = page.getByRole("textbox", { name: "Second" });
    await expect
      .element(secondInput)
      .toHaveAccessibleDescription("Second tooltip");

    await rerender(content(false));
    await expect
      .element(secondInput)
      .toHaveAccessibleDescription("Second tooltip");
  });
});
