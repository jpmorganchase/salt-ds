import {
  Button,
  Checkbox,
  CheckboxGroup,
  ComboBox,
  Dropdown,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  MultilineInput,
  NumberInput,
  Option,
  Pill,
  PillGroup,
  RadioButton,
  RadioButtonGroup,
  RangeSlider,
  Rating,
  Slider,
  Switch,
  Tooltip,
} from "@salt-ds/core";
import { Fragment, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
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
  describe("WHEN controls are provided", () => {
    it("THEN it identifies multiple controls without adding a wrapper", async () => {
      const { container } = await renderWithSalt(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Fragment key="controls">
            <Input defaultValue="First value" />
            <Input defaultValue="Second value" />
          </Fragment>
        </FormField>,
      );
      const formField = container.querySelector(".saltFormField");

      expect(formField).toHaveClass("saltFormField-hasControls");
      expect(formField?.children).toHaveLength(3);
    });
  });

  describe("WHEN controls are not provided", () => {
    it("THEN it does not add the controls modifier", async () => {
      const { container } = await renderWithSalt(
        <FormField>
          <Fragment key="non-controls">
            <FormFieldLabel>Label</FormFieldLabel>
            <FormFieldHelperText>Helper text</FormFieldHelperText>
          </Fragment>
        </FormField>,
      );

      expect(container.querySelector(".saltFormField")).not.toHaveClass(
        "saltFormField-hasControls",
      );
    });
  });

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

  describe("WHEN FormFieldLabel or FormFieldHelperText isn't rendered", () => {
    function WrappedLabel() {
      return (
        <div>
          <FormFieldLabel>Label</FormFieldLabel>
        </div>
      );
    }

    function WrappedHelperText() {
      return (
        <div>
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </div>
      );
    }

    it("THEN the control isn't described by missing helper text", async () => {
      await renderWithSalt(
        <FormField id="test-id">
          <FormFieldLabel>Label</FormFieldLabel>
          <Input />
        </FormField>,
      );
      const input = page.getByRole("textbox");
      await expect
        .element(input)
        .toHaveAttribute("aria-labelledby", "label-test-id");
      await expect.element(input).not.toHaveAttribute("aria-describedby");
    });

    it("THEN the control is described by helper text added and removed later", async () => {
      const { rerender } = await renderWithSalt(
        <FormField id="test-id">
          <FormFieldLabel>Label</FormFieldLabel>
          <Input />
        </FormField>,
      );
      const input = page.getByRole("textbox");
      await expect.element(input).not.toHaveAttribute("aria-describedby");

      await rerender(
        <FormField id="test-id">
          <FormFieldLabel>Label</FormFieldLabel>
          <Input />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>,
      );
      await expect
        .element(input)
        .toHaveAttribute("aria-describedby", "helperText-test-id");
      await expect.element(input).toHaveAccessibleDescription("Helper text");

      await rerender(
        <FormField id="test-id">
          <FormFieldLabel>Label</FormFieldLabel>
          <Input />
        </FormField>,
      );
      await expect.element(input).not.toHaveAttribute("aria-describedby");
    });

    it("THEN the control isn't labelled by a missing label, until one is added", async () => {
      const { rerender } = await renderWithSalt(
        <FormField id="test-id">
          <Input aria-label="Input label" />
        </FormField>,
      );
      const input = page.getByRole("textbox");
      await expect.element(input).not.toHaveAttribute("aria-labelledby");
      await expect.element(input).toHaveAccessibleName("Input label");

      const consoleSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await rerender(
        <FormField id="test-id">
          <FormFieldLabel>Label</FormFieldLabel>
          <Input aria-label="Input label" />
        </FormField>,
      );
      await expect
        .element(input)
        .toHaveAttribute("aria-labelledby", "label-test-id");
      await expect.element(input).toHaveAccessibleName("Label");
      consoleSpy.mockRestore();
    });

    it("THEN a label and helper text inside other components are associated with the control", async () => {
      const { rerender } = await renderWithSalt(
        <FormField id="test-id">
          <WrappedLabel />
          <Input />
          <WrappedHelperText />
        </FormField>,
      );
      const input = page.getByRole("textbox");
      await expect.element(input).toHaveAccessibleName("Label");
      await expect.element(input).toHaveAccessibleDescription("Helper text");
      await expect
        .element(page.getByText("Label"))
        .toHaveAttribute("id", "label-test-id");
      await expect
        .element(page.getByText("Helper text"))
        .toHaveAttribute("id", "helperText-test-id");

      await rerender(
        <FormField id="test-id">
          <Input />
        </FormField>,
      );
      await expect.element(input).not.toHaveAttribute("aria-labelledby");
      await expect.element(input).not.toHaveAttribute("aria-describedby");
    });
  });

  describe("WHEN a form control has an aria-label", () => {
    const ariaLabel = "Work email address";
    const controls: [string, ReactNode][] = [
      ["Input", <Input key="control" aria-label={ariaLabel} />],
      [
        "MultilineInput",
        <MultilineInput key="control" aria-label={ariaLabel} />,
      ],
      ["NumberInput", <NumberInput key="control" aria-label={ariaLabel} />],
      [
        "ComboBox",
        <ComboBox key="control" aria-label={ariaLabel}>
          <Option value="One" />
        </ComboBox>,
      ],
      [
        "Dropdown",
        <Dropdown key="control" aria-label={ariaLabel}>
          <Option value="One" />
        </Dropdown>,
      ],
      ["Checkbox", <Checkbox key="control" aria-label={ariaLabel} />],
      [
        "RadioButton",
        <RadioButton key="control" aria-label={ariaLabel} value="one" />,
      ],
      ["Switch", <Switch key="control" aria-label={ariaLabel} />],
      ["Slider", <Slider key="control" aria-label={ariaLabel} />],
      ["RangeSlider", <RangeSlider key="control" aria-label={ariaLabel} />],
      ["Rating", <Rating key="control" aria-label={ariaLabel} />],
      [
        "CheckboxGroup",
        <CheckboxGroup key="control" aria-label={ariaLabel}>
          <Checkbox label="One" value="one" />
        </CheckboxGroup>,
      ],
      [
        "RadioButtonGroup",
        <RadioButtonGroup key="control" aria-label={ariaLabel}>
          <RadioButton label="One" value="one" />
        </RadioButtonGroup>,
      ],
      [
        "PillGroup",
        <PillGroup key="control" aria-label={ariaLabel}>
          <Pill value="one">One</Pill>
        </PillGroup>,
      ],
    ];

    it.each(controls)(
      "THEN %s warns that the aria-label is ignored when a FormFieldLabel is rendered",
      async (name, control) => {
        const consoleSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => undefined);
        await renderWithSalt(
          <FormField>
            <FormFieldLabel>Email</FormFieldLabel>
            {control}
          </FormField>,
        );
        await expect
          .poll(() =>
            consoleSpy.mock.calls.filter(
              ([message]) =>
                message ===
                `Salt: aria-label "${ariaLabel}" is ignored because FormFieldLabel "Email" provides the accessible name. Use aria-labelledby to add to the name, or aria-describedby to add a description.`,
            ),
          )
          .toEqual([
            [
              expect.any(String),
              expect.any(HTMLElement),
              // RangeSlider puts the aria-label on both thumbs.
              ...(name === "RangeSlider" ? [expect.any(HTMLElement)] : []),
            ],
          ]);
        consoleSpy.mockRestore();
      },
    );

    it("THEN it warns once when the control re-renders", async () => {
      const consoleSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const { rerender } = await renderWithSalt(
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          <Input aria-label={ariaLabel} />
        </FormField>,
      );
      await rerender(
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          <Input aria-label={ariaLabel} placeholder="name@example.com" />
        </FormField>,
      );
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).includes("is ignored because FormFieldLabel"),
        ),
      ).toHaveLength(1);
      consoleSpy.mockRestore();
    });

    it("THEN it warns when the aria-label only appears inside a word of the name", async () => {
      const consoleSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await renderWithSalt(
        <FormField>
          <FormFieldLabel>Update frequency</FormFieldLabel>
          <Input aria-label="Date" />
        </FormField>,
      );
      await expect
        .poll(() =>
          consoleSpy.mock.calls.filter(
            ([message]) =>
              message ===
              'Salt: aria-label "Date" is ignored because FormFieldLabel "Update frequency" provides the accessible name. Use aria-labelledby to add to the name, or aria-describedby to add a description.',
          ),
        )
        .toHaveLength(1);
      consoleSpy.mockRestore();
    });

    it("THEN it checks the name without regex lookbehind, which older Safari versions don't support", async () => {
      const consoleSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      // Simulate Safari < 16.4, which throws a SyntaxError for lookbehind.
      vi.stubGlobal(
        "RegExp",
        new Proxy(RegExp, {
          construct(target, args: ConstructorParameters<typeof RegExp>) {
            if (/\(\?<[=!]/.test(String(args[0]))) {
              throw new SyntaxError("Invalid regular expression");
            }
            return Reflect.construct(target, args);
          },
        }),
      );
      try {
        await renderWithSalt(
          <FormField>
            <FormFieldLabel>Update frequency</FormFieldLabel>
            <Input aria-label="Date" />
          </FormField>,
        );
        await expect
          .poll(() =>
            consoleSpy.mock.calls.filter(([message]) =>
              String(message).startsWith('Salt: aria-label "Date" is ignored'),
            ),
          )
          .toHaveLength(1);
      } finally {
        vi.unstubAllGlobals();
        consoleSpy.mockRestore();
      }
    });

    it("THEN it matches the aria-label inside words for scripts written without spaces", async () => {
      const consoleSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await renderWithSalt(
        <>
          <FormField>
            <FormFieldLabel>開始日付</FormFieldLabel>
            <Input aria-label="日付" />
          </FormField>
          <FormField>
            <FormFieldLabel>メールアドレス</FormFieldLabel>
            <Input aria-label="メール" />
          </FormField>
          <FormField>
            <FormFieldLabel>วันที่เริ่มต้น</FormFieldLabel>
            <Input aria-label="วันที่" />
          </FormField>
          <FormField>
            <FormFieldLabel>開始Date</FormFieldLabel>
            <Input aria-label="Date" />
          </FormField>
        </>,
      );
      await expect
        .element(page.getByRole("textbox", { name: "開始日付" }))
        .toBeInTheDocument();
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).includes("is ignored because FormFieldLabel"),
        ),
      ).toHaveLength(0);
      consoleSpy.mockRestore();
    });

    it("THEN it does not warn when the aria-label is already in the name, without a FormFieldLabel, outside a FormField, or for a Checkbox in a CheckboxGroup", async () => {
      const consoleSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await renderWithSalt(
        <>
          <FormField>
            <FormFieldLabel>Work email address</FormFieldLabel>
            <Input aria-label="work email" />
          </FormField>
          <FormField>
            <FormFieldLabel>Your e-mail</FormFieldLabel>
            <Input aria-label="E-MAIL" />
          </FormField>
          <FormField>
            <FormFieldLabel>Date:</FormFieldLabel>
            <Input aria-label="date" />
          </FormField>
          <FormField>
            <Input aria-label={ariaLabel} />
          </FormField>
          <Input aria-label={ariaLabel} />
          <FormField>
            <FormFieldLabel>Email</FormFieldLabel>
            <CheckboxGroup>
              <Checkbox aria-label={ariaLabel} value="one" />
            </CheckboxGroup>
          </FormField>
        </>,
      );
      await expect
        .element(page.getByRole("textbox", { name: ariaLabel }).first())
        .toBeInTheDocument();
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).includes("is ignored because FormFieldLabel"),
        ),
      ).toHaveLength(0);
      consoleSpy.mockRestore();
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

      it("THEN the input is described by the tooltip while it's shown", async () => {
        await renderWithSalt(tooltipForm({ id: "test-id" }));
        const input = page.getByRole("textbox");
        await expect.element(input).not.toHaveAttribute("aria-describedby");
        await input.hover();
        await expect.element(page.getByRole("tooltip")).toBeVisible();
        await expect
          .element(input)
          .toHaveAttribute(
            "aria-describedby",
            expect.stringMatching(/(^| )helperText-test-id( |$)/),
          );
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
