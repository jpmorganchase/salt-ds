import { Dropdown, FormField } from "@salt-ds/lab";

const testSource = ["Bar", "Foo", "Foo Bar", "Baz"];

describe("GIVEN a Dropdown component", () => {
  describe("WHEN the Dropdown is rendered within FormField", () => {
    it("THEN it should show focus ring around form field when focused", () => {
      cy.mount(
        <FormField label="Dropdown" id="dropdown-in-form-field">
          <Dropdown source={testSource} />
        </FormField>,
      );
      cy.findByLabelText("Dropdown").focus();
      cy.get(".saltFormFieldLegacy").should(
        "have.class",
        "saltFormFieldLegacy-focused",
      );
    });
  });

  it("it should close the source list when selecting the same option", () => {
    cy.mount(<Dropdown id="test" source={testSource} selected="Bar" />);
    cy.get("#test-control").click();

    cy.get("#test-popup").should("be.visible");
    cy.findAllByRole("option", { name: "Bar" }).eq(1).click();
    cy.get("#test-popup").should("not.exist");
  });
});
