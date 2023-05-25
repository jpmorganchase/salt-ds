import { Input, FormFieldLegacy, useFormFieldLegacyProps } from "@salt-ds/lab";

const MockControl = ({ ...rest }: any) => {
  const FormFieldLegacyProps = useFormFieldLegacyProps();

  return (
    <div
      tabIndex={1}
      {...rest}
      {...FormFieldLegacyProps.a11yProps}
      id="child-component"
    >
      Child Component
    </div>
  );
};

describe("GIVEN a FormFieldLegacy", () => {
  describe("WHEN a label is provided", () => {
    it("THEN the label is rendered", () => {
      cy.mount(
        <FormFieldLegacy label="A label" LabelProps={{ id: "label-id" }}>
          <MockControl />
        </FormFieldLegacy>
      );

      cy.findByLabelText("A label").should("exist");
      cy.findByText("Child Component").should(
        "have.attr",
        "aria-labelledby",
        "label-id"
      );
    });
  });

  describe("WHEN disabled", () => {
    it("THEN inner component should have disabled set from useFormFieldLegacyProps.a11yProps", () => {
      cy.mount(
        <FormFieldLegacy label="Disabled form field" disabled>
          <MockControl />
        </FormFieldLegacy>
      );
      cy.findByText("Child Component").should("have.attr", "disabled");
    });
  });

  describe("WHEN helperText is provided", () => {
    it("THEN the helperText is rendered", () => {
      cy.mount(
        <FormFieldLegacy
          label="A label"
          LabelProps={{ id: "label-id" }}
          helperText="Helper Text"
          HelperTextProps={{ id: "helper-text" }}
        >
          <MockControl />
        </FormFieldLegacy>
      );

      cy.findByText("Helper Text").should("exist");
      cy.findByText("Child Component")
        .should("have.attr", "aria-describedby", "helper-text")
        .and("have.attr", "aria-labelledby", "label-id");
    });
  });

  describe("WHEN helperText is NOT provided", () => {
    it("THEN the helperText is NOT rendered", () => {
      cy.mount(
        <FormFieldLegacy label="A label">
          <MockControl />
        </FormFieldLegacy>
      );
      cy.findByText("Helper Text").should("not.exist");
    });
  });

  describe("WHEN readonly", () => {
    it("THEN inner component should have readOnly set from useFormFieldLegacyProps.a11yProps", () => {
      cy.mount(
        <FormFieldLegacy label="Readonly form field" readOnly>
          <MockControl />
        </FormFieldLegacy>
      );

      cy.findByText("Child Component").should("have.attr", "readonly");
    });
  });

  describe("When the FormFieldLegacy is required", () => {
    it("THEN the child should have aria-required=true", () => {
      cy.mount(
        <FormFieldLegacy label="Required form field" required>
          <MockControl />
        </FormFieldLegacy>
      );
      cy.findByText("Child Component").should(
        "have.attr",
        "aria-required",
        "true"
      );
      cy.findByLabelText(/Required/i).should("contain.text", "Child Component");
    });
  });

  describe("When the FormFieldLegacy is not required", () => {
    it("THEN the child should not have be labelled with required", () => {
      cy.mount(
        <FormFieldLegacy label="Form field label" required={false}>
          <MockControl />
        </FormFieldLegacy>
      );
      cy.findByLabelText(/Required/i).should("not.exist");
    });

    describe("AND displayedNecessity is optional", () => {
      it("THEN the child should have be labelled with optional", () => {
        cy.mount(
          <FormFieldLegacy
            label="Form field label"
            required={false}
            LabelProps={{ displayedNecessity: "optional" }}
          >
            <MockControl />
          </FormFieldLegacy>
        );
        cy.findByLabelText(/Optional/i).should(
          "contain.text",
          "Child Component"
        );
      });
    });
  });

  describe("WHEN validation status is warning", () => {
    it("THEN it should render warning icon", () => {
      cy.mount(
        <FormFieldLegacy label="Warning validation status" validationStatus="warning">
          <Input defaultValue="Value" />
        </FormFieldLegacy>
      );
      cy.findByTestId("WarningIndicatorIcon").should(
        "have.class",
        "saltFormActivationIndicator-icon"
      );
    });

    it("THEN warning indicator icon should not be rendered if hasStatusIndicator", () => {
      cy.mount(
        <FormFieldLegacy
          label="Warning validation status"
          validationStatus="warning"
          hasStatusIndicator
        >
          <Input defaultValue="Value" />
        </FormFieldLegacy>
      );
      cy.findByTestId("WarningIndicatorIcon").should("not.exist");
    });
  });

  describe("WHEN validation status is error", () => {
    it("THEN it should render error icon", () => {
      cy.mount(
        <FormFieldLegacy label="Error validation status" validationStatus="error">
          <Input defaultValue="Value" />
        </FormFieldLegacy>
      );
      cy.findByTestId("ErrorIndicatorIcon").should(
        "have.class",
        "saltFormActivationIndicator-icon"
      );
    });

    it("THEN error indicator icon should not be rendered if hasStatusIndicator", () => {
      cy.mount(
        <FormFieldLegacy
          label="Error validation status"
          validationStatus="error"
          hasStatusIndicator
        >
          <Input defaultValue="Value" />
        </FormFieldLegacy>
      );
      cy.findByTestId("ErrorIndicatorIcon").should("not.exist");
    });
  });

  describe("WITH a nested Input", () => {
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(
        <FormFieldLegacy label="Warning validation status">
          <Input defaultValue="Value" data-testid="test-id-1" />
        </FormFieldLegacy>
      );

      cy.findByRole("textbox").focus();
      cy.checkAxeComponent();
    });

    describe("WHEN input is focused", () => {
      it("SHOULD put focus ring on form field and not the input", () => {
        cy.mount(
          <FormFieldLegacy label="Warning validation status">
            <Input defaultValue="Value" data-testid="test-id-1" />
          </FormFieldLegacy>
        );

        cy.findByRole("textbox").focus();
        cy.get(".saltFormFieldLegacy-focused").should("exist");
        cy.findByTestId("test-id-1").should(
          "not.have.class",
          "saltInput-focused"
        );
      });
    });
  });
});
