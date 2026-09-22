import {
  ComboBox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  MultilineInput,
} from "@salt-ds/core";
import type { AriaAttributes } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const controls = [
  {
    name: "Input",
    role: "textbox" as const,
    render: (props: AriaAttributes) => (
      <Input defaultValue="Draft" inputProps={{ ...props }} />
    ),
  },
  {
    name: "MultilineInput",
    role: "textbox" as const,
    render: (props: AriaAttributes) => (
      <MultilineInput defaultValue="Draft" textAreaProps={{ ...props }} />
    ),
  },
  {
    name: "ComboBox",
    role: "combobox" as const,
    render: (props: AriaAttributes) => (
      <ComboBox defaultValue="Draft" inputProps={{ ...props }} />
    ),
  },
];

describe("FormField text-control validation", () => {
  it.each(controls)(
    "$name exposes errors and respects native overrides without losing the draft",
    async ({ render, role }) => {
      const field = (
        status: "error" | "warning" | undefined,
        props: AriaAttributes = {},
      ) => (
        <FormField validationStatus={status}>
          <FormFieldLabel>Description</FormFieldLabel>
          {render(props)}
          <FormFieldHelperText>Check the description.</FormFieldHelperText>
        </FormField>
      );
      const { rerender } = await renderWithSalt(field(undefined));
      const input = page.getByRole(role, { name: "Description" });
      await input.fill("Edited draft");
      await rerender(field("error"));
      await expect.element(input).toHaveAttribute("aria-invalid", "true");
      await expect
        .element(input)
        .toHaveAccessibleDescription("Check the description.");
      await expect.element(input).toHaveValue("Edited draft");
      await rerender(field("warning"));
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await rerender(field("error", { "aria-invalid": false }));
      await expect.element(input).toHaveAttribute("aria-invalid", "false");
      await rerender(field("error", { "aria-invalid": "spelling" }));
      await expect.element(input).toHaveAttribute("aria-invalid", "spelling");
    },
  );
});
