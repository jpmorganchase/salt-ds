import { Spinner } from "@brandname/lab";

// All previous tests were snapshot tests. These tests are to check svg existence by class

describe("GIVEN a Spinner", () => {
  it("THEN should show on the screen", () => {
    cy.mount(<Spinner />);
    cy.findByRole("img").should("have.class", "uitkSvgSpinner-medium");
  });

  it("THEN should show a large spinner on the screen", () => {
    cy.mount(<Spinner size="large" />);
    cy.findByRole("img").should("have.class", "uitkSvgSpinner-large");
  });

  it("THEN should show a small spinner on the screen", () => {
    cy.mount(<Spinner size="small" />);
    cy.findByRole("img").should("have.class", "uitkSvgSpinner-small");
  });

  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<Spinner />);
    cy.checkAxeComponent();
  });
});
