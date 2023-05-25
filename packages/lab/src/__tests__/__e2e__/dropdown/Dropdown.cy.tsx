import { Dropdown, FormField } from "@salt-ds/lab";

const testSource = ["Bar", "Foo", "Foo Bar", "Baz"];

describe("GIVEN a Dropdown component", () => {
  describe("WHEN the Dropdown is rendered within FormField", () => {
    it("THEN it should show focus ring around form field when focused", () => {
      cy.mount(
        <FormField label="Dropdown" id="dropdown-in-form-field">
          <Dropdown source={testSource} />
        </FormField>
      );
      cy.findByLabelText("Dropdown").focus();
      cy.get(".saltFormFieldLegacy").should(
        "have.class",
        "saltFormFieldLegacy-focused"
      );
    });
  });
});
