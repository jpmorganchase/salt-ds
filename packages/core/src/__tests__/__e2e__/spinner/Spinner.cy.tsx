import { Spinner } from "@salt-ds/core";

// All previous tests were snapshot tests. These tests are to check svg existence by class

describe("GIVEN a Spinner", () => {
  it("THEN should show on the screen", () => {
    cy.mount(<Spinner />);
    cy.findByRole("img").should("have.class", "saltSpinner-medium");
  });
  it("THEN size 'default' should be have 'medium' classname", () => {
    cy.mount(<Spinner size="default" />);
    cy.findByRole("img").should("have.class", "saltSpinner-medium");
  });

  it("THEN should show a large spinner on the screen", () => {
    cy.mount(<Spinner size="large" />);
    cy.findByRole("img").should("have.class", "saltSpinner-large");
  });

  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<Spinner />);
    cy.checkAxeComponent();
  });
});
