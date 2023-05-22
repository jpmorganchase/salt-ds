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
        "id",
        "label-test-id"
      );
      cy.findByText("Helper text").should(
        "have.attr",
        "id",
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
      cy.findByText("Label").should("have.class", "saltText-disabled");
      cy.findByText("Helper text").should("have.class", "saltText-disabled");
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
      // cy.get(".saltIcon").should(
      //   "have.css",
      //   "fill", 
      //   "rgb(227, 43, 22)"
      // );
    });

    describe("AND is disabled", () => {
      it("THEN the StatusIndicator should not show", () => {
        cy.mount(
          <FormFieldNext disabled validationStatus="error">
            <MockChildren />
          </FormFieldNext>
        );

        cy.get(".saltFormFieldHelperText").find(".saltStatusIndicator").should("not.exist");
      });
    });

    describe("AND is readonly", () => {
      it("THEN the StatusIndicator should not show", () => {
        cy.mount(
          <FormFieldNext readOnly validationStatus="error">
            <MockChildren />
          </FormFieldNext>
        );

        cy.get(".saltFormFieldHelperText").find(".saltStatusIndicator").should("not.exist");
      });
    });

    describe("OR is success state", () => {
      it("THEN the success variant should show", () => {
        cy.mount(
          <FormFieldNext validationStatus="success">
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
          <FormFieldNext validationStatus="warning">
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

      cy.findByLabelText("Label").focus();
      cy.checkAxeComponent();
    });
  });
});
