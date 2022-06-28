import { FormField } from "@jpmorganchase/uitk-core";
import { Input } from "@jpmorganchase/uitk-lab";

describe("GIVEN an Input", () => {
  describe("WHEN validation state is warning", () => {
    it("THEN it should render warning icon", () => {
      cy.mount(
        <FormField label="Warning validation state" validationState="warning">
          <Input defaultValue="Value" />
        </FormField>
      );
      cy.findByTestId("WarningIndicatorIcon").should(
        "have.class",
        "uitkFormActivationIndicator-icon"
      );
    });
  });

  describe("WHEN validation state is error", () => {
    it("THEN it should render error icon", () => {
      cy.mount(
        <FormField label="Error validation state" validationState="error">
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
        <FormField label="Warning validation state">
          <Input defaultValue="Value" data-testid="test-id-1" />
        </FormField>
      );

      cy.findByRole("textbox").focus();
      cy.get(".uitkFormField-focused").should("exist");
    });

    it("SHOULD not put focus ring on input", () => {
      cy.mount(
        <FormField label="Warning validation state">
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
        <FormField label="Warning validation state">
          <Input defaultValue="Value" data-testid="test-id-1" />
        </FormField>
      );

      cy.findByRole("textbox").focus();
      cy.checkAxeComponent();
    });
  });
});
