import { OnSolid } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import * as onSolidStories from "~stories/on-solid/on-solid.stories";
import { checkAccessibility } from "~test-utils/checkAccessibility";

const composedStories = composeStories(onSolidStories);

describe("GIVEN an OnSolid", () => {
  checkAccessibility(composedStories);

  it("should render as a contextual variant of Button", () => {
    cy.mount(<OnSolid>Dismiss</OnSolid>);
    cy.findByRole("button", { name: "Dismiss" })
      .should("have.class", "saltButton")
      .and("have.class", "saltOnSolid");
  });

  it("should always use the transparent appearance", () => {
    cy.mount(<OnSolid>Dismiss</OnSolid>);
    cy.findByRole("button").should("have.class", "saltButton-transparent");
  });

  it("should merge a custom className with its own base class", () => {
    cy.mount(<OnSolid className="custom-class">Dismiss</OnSolid>);
    cy.findByRole("button")
      .should("have.class", "saltOnSolid")
      .and("have.class", "custom-class");
  });

  it("should forward a ref to the underlying button element", () => {
    const ref = cy.stub().as("ref");
    cy.mount(<OnSolid ref={ref}>Dismiss</OnSolid>);
    cy.get("@ref").should(
      "be.calledWith",
      Cypress.sinon.match.instanceOf(HTMLButtonElement),
    );
  });
});
