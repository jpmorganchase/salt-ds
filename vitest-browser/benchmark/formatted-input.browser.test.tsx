import { FormattedInput, FormField } from "@salt-ds/lab";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";
import { runAxeScan } from "./accessibility";

function textbox() {
  return page.getByRole("textbox");
}

describe("GIVEN FormattedInput", () => {
  it("has no accessibility violations", async () => {
    const { container } = await renderWithSalt(
      <FormField label="Formatted input">
        <FormattedInput defaultValue="The default value" />
      </FormField>,
    );
    await runAxeScan(container);
  });

  it("renders an uncontrolled default value", async () => {
    await renderWithSalt(<FormattedInput defaultValue="The default value" />);
    await expect.element(textbox()).toHaveValue("The default value");
  });

  it("calls onChange when uncontrolled input changes", async () => {
    const onChange = vi.fn();
    await renderWithSalt(
      <FormattedInput defaultValue="The default value" onChange={onChange} />,
    );
    await textbox().fill("new value");
    expect(onChange).toHaveBeenCalledWith("new value");
  });

  it("renders disabled", async () => {
    await renderWithSalt(
      <FormattedInput defaultValue="The default value" disabled />,
    );
    await expect.element(textbox()).toBeDisabled();
  });

  it("renders disabled accessibly", async () => {
    const { container } = await renderWithSalt(
      <FormField label="Formatted input">
        <FormattedInput defaultValue="The default value" disabled />
      </FormField>,
    );
    await runAxeScan(container);
  });

  it("renders read-only", async () => {
    await renderWithSalt(
      <FormattedInput defaultValue="The default value" readOnly />,
    );
    await expect.element(textbox()).toHaveAttribute("readonly");
  });

  it("renders read-only accessibly", async () => {
    const { container } = await renderWithSalt(
      <FormField label="Formatted input">
        <FormattedInput defaultValue="The default value" readOnly />
      </FormField>,
    );
    await runAxeScan(container);
  });

  it("renders a controlled value", async () => {
    await renderWithSalt(<FormattedInput value="text value" />);
    await expect.element(textbox()).toHaveValue("text value");
  });

  it("calls onChange when controlled input changes", async () => {
    const onChange = vi.fn();
    function ControlledFormattedInput() {
      const [value, setValue] = useState("text value");
      return (
        <FormattedInput
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue);
            onChange(nextValue);
          }}
        />
      );
    }
    await renderWithSalt(<ControlledFormattedInput />);
    await textbox().fill("new value");
    expect(onChange).toHaveBeenCalledWith("new value");
  });

  it("renders mask text", async () => {
    await renderWithSalt(<FormattedInput mask="XX-XX-XX" />);
    await expect.element(page.getByText("XX-XX-XX")).toBeInTheDocument();
  });

  it("uses the mask as its accessible label", async () => {
    await renderWithSalt(<FormattedInput mask="XX-XX-XX" />);
    await expect.element(textbox()).toHaveAttribute("aria-label", "XX-XX-XX");
  });

  it("renders a partial mask for a value", async () => {
    await renderWithSalt(<FormattedInput mask="XX-XX-XX" value="12" />);
    await expect.element(page.getByText("12-XX-XX")).toBeInTheDocument();
  });

  it("renders its mask accessibly", async () => {
    const { container } = await renderWithSalt(
      <FormattedInput mask="XX-XX-XX" />,
    );
    await runAxeScan(container);
  });

  it("self-references a generated id", async () => {
    await renderWithSalt(<FormattedInput mask="XX-XX-XX" />);
    const input = textbox().element();
    expect(input.getAttribute("aria-labelledby")).toBe(input.id);
  });

  it("self-references a provided id", async () => {
    await renderWithSalt(<FormattedInput mask="XX-XX-XX" id="staticId" />);
    await expect
      .element(textbox())
      .toHaveAttribute("aria-labelledby", "staticId");
    await expect.element(textbox()).toHaveAttribute("id", "staticId");
  });

  it("ignores a supplied aria-label", async () => {
    await renderWithSalt(
      <FormattedInput
        mask="XX-XX-XX"
        inputProps={{ "aria-label": "fakelabel" }}
      />,
    );
    await expect
      .element(textbox())
      .not.toHaveAttribute("aria-label", "fakelabel");
  });

  it("combines a supplied aria-labelledby with its own id", async () => {
    await renderWithSalt(
      <FormattedInput
        mask="XX-XX-XX"
        id="staticId"
        inputProps={{ "aria-labelledby": "fakeId" }}
      />,
    );
    await expect
      .element(textbox())
      .toHaveAttribute("aria-labelledby", "fakeId staticId");
    await expect.element(textbox()).toHaveAttribute("id", "staticId");
  });

  it("passes rifmOptions through", async () => {
    await renderWithSalt(
      <FormattedInput
        rifmOptions={{ replace: (value) => value.toUpperCase() }}
      />,
    );
    await textbox().fill("lowercase");
    await expect.element(textbox()).toHaveValue("LOWERCASE");
  });

  it("applies the input class to its mask", async () => {
    await renderWithSalt(
      <FormattedInput inputProps={{ className: "inputClassName" }} />,
    );
    await expect.element(textbox()).toHaveClass("inputClassName");
    const mask = document.querySelector("span");
    expect(mask).toHaveClass("inputClassName");
  });
});
