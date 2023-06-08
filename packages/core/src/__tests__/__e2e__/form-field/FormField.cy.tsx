import {
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
  Tooltip,
} from "@salt-ds/core";

const MockChildren = () => {
  return (
    <>
      <FormFieldLabel>Label</FormFieldLabel>
      <div />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </>
  );
};

describe("GIVEN a FormField", () => {
  describe("WHEN FormFieldLabel is provided", () => {
    it("THEN the label is rendered", () => {
      cy.mount(
        <FormField>
          <MockChildren />
        </FormField>
      );

      cy.findByText("Label").should("exist");
    });
  });

  describe("WHEN FormFieldHelperText is provided", () => {
    it("THEN the helper text is rendered", () => {
      cy.mount(
        <FormField>
          <MockChildren />
        </FormField>
      );

      cy.findByText("Helper text").should("exist");
    });
  });

  describe("WHEN an id is provided", () => {
    it("THEN the label and helper text should have the corresponding ids", () => {
      cy.mount(
        <FormField id={"test-id"}>
          <MockChildren />
        </FormField>
      );

      cy.findByText("Label").should("have.attr", "id", "label-test-id");
      cy.findByText("Helper text").should(
        "have.attr",
        "id",
        "helperText-test-id"
      );
    });
  });

  describe("WHEN disabled", () => {
    it("THEN inner components should have disabled set from useFormFieldProps.a11yProps", () => {
      cy.mount(
        <FormField disabled>
          <MockChildren />
        </FormField>
      );
      cy.findByText("Label").should("have.class", "saltText-disabled");
      cy.findByText("Helper text").should("have.class", "saltText-disabled");
    });
  });

  describe("WHEN has error validationStatus", () => {
    it("THEN StatusIndicator should show within Helper Text", () => {
      cy.mount(
        <FormField validationStatus="error">
          <MockChildren />
        </FormField>
      );

      cy.get(".saltStatusIndicator").should(
        "have.class",
        "saltStatusIndicator-error"
      );
    });

    describe("AND is disabled", () => {
      it("THEN the StatusIndicator should not show", () => {
        cy.mount(
          <FormField disabled validationStatus="error">
            <MockChildren />
          </FormField>
        );

        cy.get(".saltFormFieldHelperText")
          .find(".saltStatusIndicator")
          .should("not.exist");
      });
    });

    describe("AND is readonly", () => {
      it("THEN the StatusIndicator should not show", () => {
        cy.mount(
          <FormField readOnly validationStatus="error">
            <MockChildren />
          </FormField>
        );

        cy.get(".saltFormFieldHelperText")
          .find(".saltStatusIndicator")
          .should("not.exist");
      });
    });

    describe("OR is success state", () => {
      it("THEN the success variant should show", () => {
        cy.mount(
          <FormField validationStatus="success">
            <MockChildren />
          </FormField>
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
          <FormField validationStatus="warning">
            <MockChildren />
          </FormField>
        );

        cy.get(".saltStatusIndicator").should(
          "have.class",
          "saltStatusIndicator-warning"
        );
      });
    });
  });

  describe("WITH a nested Input", () => {
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Input defaultValue="Value" data-testid="test-id-1" />
          <FormFieldHelperText>Helper text</FormFieldHelperText>
        </FormField>
      );

      cy.findByLabelText("Label").focus();
      cy.checkAxeComponent();
    });

    describe("AND has tooltip helper text", () => {
      it("THEN tooltip should be visible on input hover", () => {
        cy.mount(
          <FormField>
            <FormFieldLabel>Label</FormFieldLabel>
            <Tooltip content="Helper text">
              <Input defaultValue="Value" data-testid="test-id-2" />
            </Tooltip>
          </FormField>
        );
        cy.findByLabelText("Label").realHover();

        cy.findByRole("tooltip").should("be.visible");
      });

      it("THEN should have the corresponding id", () => {
        cy.mount(
          <FormField id={"test-id"}>
            <FormFieldLabel>Label</FormFieldLabel>
            <Tooltip content="Helper text">
              <Input defaultValue="Value" data-testid="test-id-2" />
            </Tooltip>
          </FormField>
        );

        cy.findByLabelText("Label").realHover();
        cy.findByText("Helper text").should(
          "have.attr",
          "id",
          "helperText-test-id"
        );
      });

      describe("AND is disabled", () => {
        it("THEN tooltip should not be visible on input hover", () => {
          cy.mount(
            <FormField disabled>
              <FormFieldLabel>Label</FormFieldLabel>
              <Tooltip content="Helper text">
                <Input defaultValue="Value" data-testid="test-id-2" />
              </Tooltip>
            </FormField>
          );
          cy.findByLabelText("Label").realHover();

          cy.findByRole("tooltip").should("not.exist");
        });
      });

      describe("AND has validation status", () => {
        it("THEN tooltip should reflect status", () => {
          cy.mount(
            <FormField validationStatus="error">
              <FormFieldLabel>Label</FormFieldLabel>
              <Tooltip content="Helper text">
                <Input defaultValue="Value" data-testid="test-id-2" />
              </Tooltip>
            </FormField>
          );
          cy.findByLabelText("Label").realHover();

          cy.findByRole("tooltip").should("have.class", "saltTooltip-error");
        });
      });
    });
  });
});
