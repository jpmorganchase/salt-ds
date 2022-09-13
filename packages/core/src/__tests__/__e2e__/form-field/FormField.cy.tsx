import { FormField, Input } from "@jpmorganchase/uitk-core";

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
        "uitkFormActivationIndicator-icon"
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
        "uitkFormActivationIndicator-icon"
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
      cy.get(".uitkFormField-focused").should("exist");
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
        "uitkInput-focused"
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
