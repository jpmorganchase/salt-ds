import {
  FormFieldNext,
  FormFieldLabel,
  FormFieldHelperText,
  InputNext,
} from "@salt-ds/lab";

const MockChildren = () => {
  return (
    <>
      <FormFieldLabel>Label</FormFieldLabel>
      <div />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </>
  );
};

describe("GIVEN a FormFieldNext", () => {
  describe("WHEN FormFieldLabel is provided", () => {
    it("THEN the helperText is rendered", () => {
      cy.mount(
        <FormFieldNext>
          <MockChildren />
        </FormFieldNext>
      );

      cy.findByText("Label").should("exist");
    });
  });

  describe("WHEN FormFieldHelperText is provided", () => {
    it("THEN the helperText is rendered", () => {
      cy.mount(
        <FormFieldNext>
          <MockChildren />
        </FormFieldNext>
      );

      cy.findByText("Helper text").should("exist");
    });
  });


  describe("WHEN an id is provided", () => {
    it("THEN the label and helper text should have the corresponding ids", () => {
      cy.mount(
        <FormFieldNext id={"test-id"}>
          <MockChildren />
        </FormFieldNext>
      );

      cy.findByText("Label").should(
        "have.attr",
        "aria-labelledby",
        "label-test-id"
      );
      cy.findByText("Helper text").should(
        "have.attr",
        "aria-labelledby",
        "helperText-test-id"
      );
    });
  });

  describe("WHEN disabled", () => {
    it("THEN inner components should have disabled set from useFormFieldNextProps.a11yProps", () => {
      cy.mount(
        <FormFieldNext disabled>
          <MockChildren />
        </FormFieldNext>
      );
      cy.findByText("Label").should("have.attr", "disabled");
      cy.findByText("Helper text").should("have.attr", "disabled");
    });
  });

  describe("WHEN readonly", () => {
    it("THEN helper text should have readOnly set from useFormFieldNextProps.a11yProps", () => {
      cy.mount(
        <FormFieldNext readOnly>
          <MockChildren />
        </FormFieldNext>
      );

      cy.findByTestId("form-field-test").should("have.attr", "readonly");
    });
  });

  describe("WHEN has error validationStatus", () => {
    it("THEN StatusIndicator should show within Helper Text", () => {
      cy.mount(
        <FormFieldNext validationStatus="error">
          <MockChildren />
        </FormFieldNext>
      );

      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-error"
      );
    });

    describe("AND is disabled", () => {
      it("THEN the StatusIndicator should not show", () => {
        cy.mount(
          <FormFieldNext disabled validationStatus="error">
            <MockChildren />
          </FormFieldNext>
        );

        cy.get(".saltStatusIndicator").should(
          "not.have.class",
          "saltStatusIndicator-error"
        );
      });
    });

    describe("AND is readonly", () => {
      it("THEN the StatusIndicator should not show", () => {
        cy.mount(
          <FormFieldNext readOnly validationStatus="error">
            <MockChildren />
          </FormFieldNext>
        );

        cy.get(".saltStatusIndicator").should(
          "not.have.class",
          "saltStatusIndicator-error"
        );
      });
    });

    describe("OR is success state", () => {
      it("THEN the success variant should show", () => {
        cy.mount(
          <FormFieldNext readOnly validationStatus="success">
            <MockChildren />
          </FormFieldNext>
        );

        cy.get(".saltStatusIndicator").should(
          "have.class",
          "saltStatusIndicator-success"
        );
      });
    });

    describe("OR is warning state", () => {
      it("THEN the warning variant should show", () => {
        cy.mount(
          <FormFieldNext readOnly validationStatus="warning">
            <MockChildren />
          </FormFieldNext>
        );

        cy.get(".saltStatusIndicator").should(
          "have.class",
          "saltStatusIndicator-warning"
        );
      });
    });
  });

  describe("WITH a nested InputNext", () => {
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(
        <FormFieldNext>
          <FormFieldLabel>Label</FormFieldLabel>
          <InputNext defaultValue="Value" data-testid="test-id-1" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormFieldNext>
      );

      cy.findByRole("textbox").focus();
      cy.checkAxeComponent();
    });
  });
});
