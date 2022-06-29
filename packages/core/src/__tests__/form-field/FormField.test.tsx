import { render } from "@testing-library/react";

import { AriaAnnouncerProvider } from "../../aria-announcer";
import { FormField, FormFieldProps } from "../../form-field";
import { useFormFieldProps } from "../../form-field-context";

const label = "A Label";
const labelId = "label-id";
const helperText = "Helper Text";
const helperTextId = "helper-text-id";

const MockControl = ({
  a11yPropsCallback,
  formFieldPropsCallback,
  ...rest
}: any) => {
  const formFieldProps = useFormFieldProps();
  formFieldPropsCallback?.(formFieldProps);
  a11yPropsCallback?.(formFieldProps.a11yProps);

  return (
    <div
      tabIndex={1}
      {...rest}
      {...formFieldProps.a11yProps}
      id="child-component"
    >
      Child Component
    </div>
  );
};

function renderFormField({
  ChildComponentProps = {},
  ...rest
}: Partial<FormFieldProps> & { ChildComponentProps?: any } = {}) {
  return render(
    <AriaAnnouncerProvider>
      <FormField
        HelperTextProps={{ id: helperTextId }}
        LabelProps={{ id: labelId }}
        {...rest}
      >
        <MockControl {...ChildComponentProps} />
      </FormField>
    </AriaAnnouncerProvider>
  );
}

describe("GIVEN a FormField", () => {
  describe("WHEN rendered", () => {
    test("THEN `inFormField` is true", () => {
      // arrange
      const formFieldContext = jest.fn();
      renderFormField({
        ChildComponentProps: { formFieldPropsCallback: formFieldContext },
      });

      expect(formFieldContext.mock.calls[0][0]).toHaveProperty(
        "inFormField",
        true
      );
    });
  });

  describe("WHEN a label is provided", () => {
    test("THEN the label is rendered", () => {
      const { getByLabelText, getByText } = renderFormField({ label });
      const labelElem = getByLabelText(label);
      const childElem = getByText(/Child Component/);
      expect(labelElem).toBeDefined();
      const ariaLabelledBy = childElem.getAttribute("aria-labelledby");
      expect(ariaLabelledBy).toContain(labelId);
    });
  });

  describe("WHEN disabled", () => {
    test("THEN inner component should have disabled set from useFormFieldProps.a11yProps", () => {
      const mockFn = jest.fn();
      render(
        <FormField label="Disabled form field" disabled>
          <MockControl a11yPropsCallback={mockFn} />
        </FormField>
      );
      expect(mockFn).toBeCalledWith(
        expect.objectContaining({ disabled: true })
      );
    });
  });

  describe("WHEN helperText is provided", () => {
    test("THEN the helperText is rendered", () => {
      const { container, getByText } = renderFormField({
        helperText,
        label,
      });
      const helperTextElem = container.querySelector("#" + helperTextId);
      const childElem = getByText(/Child Component/);
      expect(helperTextElem).toBeInTheDocument();
      const ariaLabelledBy = childElem.getAttribute("aria-labelledby");
      const ariaDescribedBy = childElem.getAttribute("aria-describedby");
      expect(ariaLabelledBy).toContain(labelId);
      expect(ariaDescribedBy).toContain(helperTextId);
    });
  });

  describe("WHEN helperText is NOT provided", () => {
    test("THEN the helperText is NOT rendered", () => {
      const { queryByText } = renderFormField({ label });
      const helperTextElem = queryByText(helperText);
      expect(helperTextElem).toBe(null);
    });
  });

  describe("WHEN readonly", () => {
    test("THEN inner component should have readOnly set from useFormFieldProps.a11yProps", () => {
      const mockFn = jest.fn();
      render(
        <FormField label="Readonly form field" readOnly>
          <MockControl a11yPropsCallback={mockFn} />
        </FormField>
      );
      expect(mockFn).toBeCalledWith(
        expect.objectContaining({ readOnly: true })
      );
    });
  });

  describe("When the FormField is required", () => {
    test("THEN the child should have aria-required=true", () => {
      const { getByText } = render(
        <FormField label="Required form field" required>
          <MockControl />
        </FormField>
      );
      const childElem = getByText(/Child Component/);
      expect(childElem).toHaveAttribute("aria-required", "true");
    });

    test("THEN the child should have be labelled with required", () => {
      const { getByLabelText } = render(
        <FormField label="Form field label" required>
          <MockControl />
        </FormField>
      );
      expect(getByLabelText(/Required/i)).toHaveTextContent(/Child Component/);
    });
  });

  describe("When the FormField is not required", () => {
    test("THEN the child should not have be labelled with required", () => {
      const { queryByLabelText } = render(
        <FormField label="Form field label" required={false}>
          <MockControl />
        </FormField>
      );
      expect(queryByLabelText(/Required/i)).toBeNull();
    });

    describe("AND displayedNecessity is optional", () => {
      test("THEN the child should have be labelled with optional", () => {
        const { getByLabelText } = render(
          <FormField
            label="Form field label"
            required={false}
            LabelProps={{ displayedNecessity: "optional" }}
          >
            <MockControl />
          </FormField>
        );
        expect(getByLabelText(/Optional/i)).toHaveTextContent(
          /Child Component/
        );
      });
    });
  });

  describe("When validation state is 'error'", () => {
    test("THEN error indicator icon should be rendered", () => {
      const { queryByTestId } = renderFormField({
        label,
        validationState: "error",
      });
      expect(queryByTestId("ErrorIndicatorIcon")).toBeInTheDocument();
    });

    test("THEN error indicator icon should not be rendered if hasStatusIndicator", () => {
      const { queryByTestId } = renderFormField({
        label,
        validationState: "error",
        hasStatusIndicator: true,
      });
      expect(queryByTestId("ErrorIndicatorIcon")).not.toBeInTheDocument();
    });
  });

  describe("When validation state is 'warning'", () => {
    test("THEN warning indicator icon should be rendered", () => {
      const { queryByTestId } = renderFormField({
        label,
        validationState: "warning",
      });
      expect(queryByTestId("WarningIndicatorIcon")).toBeInTheDocument();
    });

    test("THEN warning indicator icon should not be rendered if hasStatusIndicator", () => {
      const { queryByTestId } = renderFormField({
        label,
        validationState: "warning",
        hasStatusIndicator: true,
      });
      expect(queryByTestId("WarningIndicatorIcon")).not.toBeInTheDocument();
    });
  });
});
