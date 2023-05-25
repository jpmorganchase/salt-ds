import { Dropdown, FormFieldLegacy } from "@salt-ds/lab";

const testSource = ["Bar", "Foo", "Foo Bar", "Baz"];

describe("GIVEN a Dropdown component", () => {
  describe("WHEN the Dropdown is rendered within FormFieldLegacy", () => {
    it("THEN it should show focus ring around form field when focused", () => {
      cy.mount(
        <FormFieldLegacy label="Dropdown" id="dropdown-in-form-field">
          <Dropdown source={testSource} />
        </FormFieldLegacy>
      );
      cy.findByLabelText("Dropdown").focus();
      cy.get(".saltFormFieldLegacy").should("have.class", "saltFormFieldLegacy-focused");
    });
  });
});
