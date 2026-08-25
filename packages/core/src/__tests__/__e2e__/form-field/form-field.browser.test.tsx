import {
  Button,
  Checkbox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  RadioButton,
  Tooltip,
} from "@salt-ds/core";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { runAxeScan } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";

function MockChildren() {
  return (
    <>
      <FormFieldLabel>Label</FormFieldLabel>
      <div />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </>
  );
}

describe("GIVEN a FormField", () => {
  describe("WHEN FormFieldLabel is provided", () => {
    it("THEN the label is rendered", async () => {
      await renderWithSalt(
        <FormField>
          <MockChildren />
        </FormField>,
      );
      await expect.element(page.getByText("Label")).toBeInTheDocument();
    });
  });

  describe("WHEN FormFieldHelperText is provided", () => {
    it("THEN the helper text is rendered", async () => {
      await renderWithSalt(
        <FormField>
          <MockChildren />
        </FormField>,
      );
      const helper = page.getByText("Helper text");
      await expect.element(helper).toBeInTheDocument();
      await expect.element(helper).toHaveClass("saltText-secondary");
    });
  });

  describe("WHEN an id is provided", () => {
    it("THEN the label and helper text should have the corresponding ids", async () => {
      await renderWithSalt(
        <FormField id="test-id">
          <MockChildren />
        </FormField>,
      );
      await expect
        .element(page.getByText("Label"))
        .toHaveAttribute("id", "label-test-id");
      await expect
        .element(page.getByText("Helper text"))
        .toHaveAttribute("id", "helperText-test-id");
    });
  });

  describe("WHEN disabled", () => {
    it("THEN inner components should have disabled set from useFormFieldProps.a11yProps", async () => {
      await renderWithSalt(
        <FormField disabled>
          <MockChildren />
        </FormField>,
      );
      await expect
        .element(page.getByText("Label"))
        .toHaveClass("saltText-disabled");
      await expect
        .element(page.getByText("Helper text"))
        .toHaveClass("saltText-disabled");
    });
  });

  describe("WHEN has error validationStatus", () => {
    it("THEN StatusIndicator should show within Helper Text", async () => {
      await renderWithSalt(
        <FormField validationStatus="error">
          <MockChildren />
        </FormField>,
      );
      expect(document.querySelector(".saltStatusIndicator")).toHaveClass(
        "saltStatusIndicator-error",
      );
      await expect
        .element(page.getByText("Helper text"))
        .toHaveClass("saltText-error");
    });

    describe("AND is disabled", () => {
      it("THEN the StatusIndicator should not show", async () => {
        await renderWithSalt(
          <FormField disabled validationStatus="error">
            <MockChildren />
          </FormField>,
        );
        expect(
          document.querySelector(
            ".saltFormFieldHelperText .saltStatusIndicator",
          ),
        ).not.toBeInTheDocument();
      });
    });

    describe("AND is readonly", () => {
      it("THEN the StatusIndicator should not show", async () => {
        await renderWithSalt(
          <FormField readOnly validationStatus="error">
            <MockChildren />
          </FormField>,
        );
        expect(
          document.querySelector(
            ".saltFormFieldHelperText .saltStatusIndicator",
          ),
        ).not.toBeInTheDocument();
      });
    });

    describe("OR is success state", () => {
      it("THEN the success variant should show", async () => {
        await renderWithSalt(
          <FormField validationStatus="success">
            <MockChildren />
          </FormField>,
        );
        expect(document.querySelector(".saltStatusIndicator")).toHaveClass(
          "saltStatusIndicator-success",
        );
        await expect
          .element(page.getByText("Helper text"))
          .toHaveClass("saltText-success");
      });
    });

    describe("OR is warning state", () => {
      it("THEN the warning variant should show", async () => {
        await renderWithSalt(
          <FormField validationStatus="warning">
            <MockChildren />
          </FormField>,
        );
        expect(document.querySelector(".saltStatusIndicator")).toHaveClass(
          "saltStatusIndicator-warning",
        );
        await expect
          .element(page.getByText("Helper text"))
          .toHaveClass("saltText-warning");
      });
    });
  });

  describe("WITH a nested Input", () => {
    it("SHOULD have no a11y violations on load", async () => {
      const { container } = await renderWithSalt(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Input defaultValue="Value" data-testid="test-id-1" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>,
      );
      (await page.getByLabelText("Label").element()).focus();
      await runAxeScan(container);
    });

    describe("WITH a necessity label", () => {
      it("THEN required should display if opted", async () => {
        await renderWithSalt(
          <FormField necessity="required">
            <FormFieldLabel>Label</FormFieldLabel>
            <Input defaultValue="Value" />
            <FormFieldHelperText>Helper text</FormFieldHelperText>
          </FormField>,
        );
        await expect.element(page.getByText("(Required)")).toBeInTheDocument();
        await expect
          .element(page.getByLabelText("Label (Required)"))
          .toHaveAttribute("required");
      });

      it("THEN optional should display if opted", async () => {
        await renderWithSalt(
          <FormField necessity="optional">
            <FormFieldLabel>Label</FormFieldLabel>
            <Input defaultValue="Value" />
            <FormFieldHelperText>Helper text</FormFieldHelperText>
          </FormField>,
        );
        await expect.element(page.getByText("(Optional)")).toBeInTheDocument();
      });

      it("THEN asterisk should display if opted", async () => {
        await renderWithSalt(
          <FormField necessity="asterisk">
            <FormFieldLabel>Label</FormFieldLabel>
            <Input defaultValue="Value" />
            <FormFieldHelperText>Helper text</FormFieldHelperText>
          </FormField>,
        );
        await expect
          .element(page.getByLabelText("Label *"))
          .toHaveAttribute("required");
      });
    });

    describe("AND has tooltip helper text", () => {
      const tooltipForm = (props: {
        disabled?: boolean;
        id?: string;
        validationStatus?: "error";
      }) => (
        <FormField {...props}>
          <FormFieldLabel>Label</FormFieldLabel>
          <Tooltip content="Helper text">
            <Input defaultValue="Value" data-testid="test-id-2" />
          </Tooltip>
        </FormField>
      );

      it("THEN tooltip should be visible on input hover", async () => {
        await renderWithSalt(tooltipForm({}));
        await page.getByLabelText("Label").hover();
        await expect.element(page.getByRole("tooltip")).toBeVisible();
      });

      it("THEN should have the corresponding id", async () => {
        await renderWithSalt(tooltipForm({ id: "test-id" }));
        await page.getByLabelText("Label").hover();
        await expect
          .element(page.getByText("Helper text"))
          .toHaveAttribute("id", "helperText-test-id");
      });

      describe("AND is disabled", () => {
        it("THEN tooltip should not be visible on input hover", async () => {
          await renderWithSalt(tooltipForm({ disabled: true }));
          await page.getByLabelText("Label").hover();
          await expect
            .element(page.getByRole("tooltip"))
            .not.toBeInTheDocument();
        });
      });

      describe("AND has validation status", () => {
        it("THEN tooltip should reflect status", async () => {
          await renderWithSalt(tooltipForm({ validationStatus: "error" }));
          await page.getByLabelText("Label").hover();
          await expect
            .element(page.getByRole("tooltip"))
            .toHaveClass("saltTooltip-error");
        });
      });
    });

    describe("AND Input has an button adornment", () => {
      const adornedForm = (props: {
        disabled?: boolean;
        readOnly?: boolean;
      }) => (
        <FormField {...props}>
          <FormFieldLabel>Label</FormFieldLabel>
          <Input
            defaultValue="Value"
            startAdornment={
              <Button disabled={props.disabled || props.readOnly}>Test</Button>
            }
            data-testid="test-id-3"
          />
        </FormField>
      );

      it("THEN should render with the adornment", async () => {
        await renderWithSalt(adornedForm({}));
        await expect.element(page.getByRole("button")).toBeVisible();
      });

      it("THEN should disable the button when disabled", async () => {
        await renderWithSalt(adornedForm({ disabled: true }));
        const button = page.getByRole("button");
        await expect.element(button).toBeVisible();
        await expect.element(button).toHaveClass("saltButton-disabled");
      });

      it("THEN should disable the button when readonly", async () => {
        await renderWithSalt(adornedForm({ readOnly: true }));
        const button = page.getByRole("button");
        await expect.element(button).toBeVisible();
        await expect.element(button).toHaveClass("saltButton-disabled");
      });
    });
  });

  describe("WITH a nested RadioButton", () => {
    it("SHOULD have no a11y violations on load", async () => {
      const { container } = await renderWithSalt(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <RadioButton label="Value" />
        </FormField>,
      );
      (await page.getByLabelText("Label").element()).focus();
      await runAxeScan(container);
    });

    it("THEN should disable the RadioButton when disabled", async () => {
      await renderWithSalt(
        <FormField disabled>
          <FormFieldLabel>Label</FormFieldLabel>
          <RadioButton label="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByLabelText("Label"))
        .toHaveAttribute("disabled");
    });

    it.skip("THEN should disable the RadioButton when readonly", async () => {
      await renderWithSalt(
        <FormField readOnly>
          <FormFieldLabel>Label</FormFieldLabel>
          <RadioButton label="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByText("Label"))
        .toHaveClass("saltRadioButton-readonly");
    });
  });

  describe("WITH a nested Checkbox", () => {
    it("SHOULD have no a11y violations on load", async () => {
      const { container } = await renderWithSalt(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Checkbox label="Value" />
        </FormField>,
      );
      (await page.getByLabelText("Label").element()).focus();
      await runAxeScan(container);
    });

    it("THEN should disable the Checkbox when disabled", async () => {
      await renderWithSalt(
        <FormField disabled>
          <FormFieldLabel>Label</FormFieldLabel>
          <Checkbox label="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByLabelText("Label"))
        .toHaveAttribute("disabled");
    });

    it.skip("THEN should disable the Checkbox when readonly", async () => {
      await renderWithSalt(
        <FormField readOnly>
          <FormFieldLabel>Label</FormFieldLabel>
          <Checkbox label="Value" />
        </FormField>,
      );
      await expect
        .element(page.getByText("Label"))
        .toHaveClass("saltCheckbox-readonly");
    });
  });
});
