import { FormField, Input, useFormFieldLegacyProps } from "@salt-ds/lab";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "../render";
import { runAxeScan } from "./accessibility";

function MockControl(rest: ComponentProps<"div">) {
  const formFieldProps = useFormFieldLegacyProps();
  return (
    <div
      tabIndex={0}
      {...rest}
      {...formFieldProps.a11yProps}
      id="child-component"
    >
      Child Component
    </div>
  );
}

describe("GIVEN a legacy FormField", () => {
  it("renders and connects its label", async () => {
    await renderWithSalt(
      <FormField label="A label" LabelProps={{ id: "label-id" }}>
        <MockControl />
      </FormField>,
    );
    await expect.element(page.getByLabelText("A label")).toBeInTheDocument();
    await expect
      .element(page.getByText("Child Component"))
      .toHaveAttribute("aria-labelledby", "label-id");
  });

  it("provides disabled state to its child", async () => {
    await renderWithSalt(
      <FormField label="Disabled form field" disabled>
        <MockControl />
      </FormField>,
    );
    await expect
      .element(page.getByText("Child Component"))
      .toHaveAttribute("disabled");
  });

  it("renders and connects helper text", async () => {
    await renderWithSalt(
      <FormField
        label="A label"
        LabelProps={{ id: "label-id" }}
        helperText="Helper Text"
        HelperTextProps={{ id: "helper-text" }}
      >
        <MockControl />
      </FormField>,
    );
    await expect.element(page.getByText("Helper Text")).toBeInTheDocument();
    const child = page.getByText("Child Component");
    await expect
      .element(child)
      .toHaveAttribute("aria-describedby", "helper-text");
    await expect.element(child).toHaveAttribute("aria-labelledby", "label-id");
  });

  it("omits helper text when it is not provided", async () => {
    await renderWithSalt(
      <FormField label="A label">
        <MockControl />
      </FormField>,
    );
    expect(page.getByText("Helper Text").elements()).toHaveLength(0);
  });

  it("provides read-only state to its child", async () => {
    await renderWithSalt(
      <FormField label="Readonly form field" readOnly>
        <MockControl />
      </FormField>,
    );
    await expect
      .element(page.getByText("Child Component"))
      .toHaveAttribute("readonly");
  });

  it("labels required children", async () => {
    await renderWithSalt(
      <FormField label="Required form field" required>
        <MockControl />
      </FormField>,
    );
    await expect
      .element(page.getByText("Child Component"))
      .toHaveAttribute("aria-required", "true");
    await expect
      .element(page.getByLabelText(/Required/i))
      .toHaveTextContent("Child Component");
  });

  it("does not add required labelling when optional", async () => {
    await renderWithSalt(
      <FormField label="Form field label" required={false}>
        <MockControl />
      </FormField>,
    );
    expect(page.getByLabelText(/Required/i).elements()).toHaveLength(0);
  });

  it("supports optional necessity labelling", async () => {
    await renderWithSalt(
      <FormField
        label="Form field label"
        required={false}
        LabelProps={{ displayedNecessity: "optional" }}
      >
        <MockControl />
      </FormField>,
    );
    await expect
      .element(page.getByLabelText(/Optional/i))
      .toHaveTextContent("Child Component");
  });

  it("renders a warning indicator", async () => {
    await renderWithSalt(
      <FormField label="Warning validation status" validationStatus="warning">
        <Input defaultValue="Value" />
      </FormField>,
    );
    await expect
      .element(page.getByTestId("WarningIndicatorIcon"))
      .toHaveClass("saltFormActivationIndicator-icon");
  });

  it("can suppress the warning indicator", async () => {
    await renderWithSalt(
      <FormField
        label="Warning validation status"
        validationStatus="warning"
        hasStatusIndicator
      >
        <Input defaultValue="Value" />
      </FormField>,
    );
    expect(page.getByTestId("WarningIndicatorIcon").elements()).toHaveLength(0);
  });

  it("renders an error indicator", async () => {
    await renderWithSalt(
      <FormField label="Error validation status" validationStatus="error">
        <Input defaultValue="Value" />
      </FormField>,
    );
    await expect
      .element(page.getByTestId("ErrorIndicatorIcon"))
      .toHaveClass("saltFormActivationIndicator-icon");
  });

  it("can suppress the error indicator", async () => {
    await renderWithSalt(
      <FormField
        label="Error validation status"
        validationStatus="error"
        hasStatusIndicator
      >
        <Input defaultValue="Value" />
      </FormField>,
    );
    expect(page.getByTestId("ErrorIndicatorIcon").elements()).toHaveLength(0);
  });

  it("runs the legacy input accessibility scan", async () => {
    const { container } = await renderWithSalt(
      <FormField label="Warning validation status">
        <Input defaultValue="Value" data-testid="test-id-1" />
      </FormField>,
    );
    await page.getByRole("textbox").click();
    await runAxeScan(container);
  });

  it("puts the focus ring on FormField instead of Input", async () => {
    await renderWithSalt(
      <FormField label="Warning validation status">
        <Input defaultValue="Value" data-testid="test-id-1" />
      </FormField>,
    );
    await page.getByRole("textbox").click();
    expect(
      document.querySelector(".saltFormFieldLegacy-focused"),
    ).not.toBeNull();
    await expect
      .element(page.getByTestId("test-id-1"))
      .not.toHaveClass("saltInputLegacy-focused");
  });
});
