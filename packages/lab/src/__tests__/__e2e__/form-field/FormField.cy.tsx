import { Input } from "../../../input";
import { FormField } from "../../../form-field";

describe("GIVEN an Input", () => {
  describe("WHEN validation status is warning", () => {
    it("THEN it should render warning icon", () => {
      cy.mount(
        <FormField label="Warning validation status" validationStatus="warning">
          <Input defaultValue="Value" />
        </FormField>
      );
      cy.findByTestId("WarningIndicatorIcon").should(
        "have.class",
        "saltFormActivationIndicator-icon"
      );
    });
  });

  describe("WHEN validation status is error", () => {
    it("THEN it should render error icon", () => {
      cy.mount(
        <FormField label="Error validation status" validationStatus="error">
          <Input defaultValue="Value" />
        </FormField>
      );
      cy.findByTestId("ErrorIndicatorIcon").should(
        "have.class",
        "saltFormActivationIndicator-icon"
      );
    });
  });

  describe("WHEN input is focused", () => {
    it("SHOULD put focus ring on form field", () => {
      cy.mount(
        <FormField label="Warning validation status">
          <Input defaultValue="Value" data-testid="test-id-1" />
        </FormField>
      );

      cy.findByRole("textbox").focus();
      cy.get(".saltFormField-focused").should("exist");
    });

    it("SHOULD not put focus ring on input", () => {
      cy.mount(
        <FormField label="Warning validation status">
          <Input defaultValue="Value" data-testid="test-id-1" />
        </FormField>
      );

      cy.findByRole("textbox").focus();
      cy.findByTestId("test-id-1").should(
        "not.have.class",
        "saltInput-focused"
      );
    });
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(
        <FormField label="Warning validation status">
          <Input defaultValue="Value" data-testid="test-id-1" />
        </FormField>
      );

      cy.findByRole("textbox").focus();
      cy.checkAxeComponent();
    });
  });
});
