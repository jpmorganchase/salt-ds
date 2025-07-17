import * as collapsibleStories from "@stories/collapsible/collapsible.stories";
import { composeStories } from "@storybook/react-vite";

const composedStories = composeStories(collapsibleStories);

const { Default } = composedStories;

describe("Given a Collapsible", () => {
  it("should have the correct accessibility attributes", () => {
    cy.mount(<Default />);

    cy.findByRole("button").then((button) => {
      cy.findByTestId("collapsible-panel").should(
        "have.attr",
        "id",
        button[0].getAttribute("aria-controls"),
      );
    });
    cy.findByRole("button").should("have.attr", "aria-expanded", "false");
    cy.findByTestId("collapsible-panel").should(
      "have.attr",
      "aria-hidden",
      "true",
    );
  });

  it("should support defaultOpen", () => {
    cy.mount(<Default defaultOpen={true} />);

    cy.findByRole("button").should("have.attr", "aria-expanded", "true");
    cy.findByTestId("panel-content").should("be.visible");
  });

  it("should support open", () => {
    cy.mount(<Default open={true} />);

    cy.findByRole("button").should("have.attr", "aria-expanded", "true");
    cy.findByTestId("panel-content").should("be.visible");
  });

  it("should toggle open state on button click", () => {
    const openChangeSpy = cy.spy().as("openChangeSpy");
    cy.mount(<Default onOpenChange={openChangeSpy} />);

    cy.findByRole("button").realClick();
    cy.findByTestId("panel-content").should("be.visible");
    cy.get("@openChangeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      true,
    );

    cy.findByRole("button").realClick();
    cy.findByTestId("panel-content").should("not.be.visible");
    cy.get("@openChangeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      false,
    );
  });

  it("should toggle open state on keyboard", () => {
    const openChangeSpy = cy.spy().as("openChangeSpy");
    cy.mount(<Default onOpenChange={openChangeSpy} />);

    cy.realPress("Tab");
    cy.realPress("Enter");
    cy.findByTestId("panel-content").should("be.visible");
    cy.get("@openChangeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      true,
    );

    cy.realPress("Space");
    cy.findByTestId("panel-content").should("not.be.visible");
    cy.get("@openChangeSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      false,
    );
  });
});
