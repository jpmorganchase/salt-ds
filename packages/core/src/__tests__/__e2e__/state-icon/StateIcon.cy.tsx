import { composeStories } from "@storybook/testing-react";
import * as stateIconStories from "@stories/state-icon.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(stateIconStories);
const { DefaultStateIcon } = composedStories;

describe("Given a State Icon", () => {
  checkAccessibility(composedStories);

  describe("WHEN a state value is provided", () => {
    it("should render an error icon", () => {
      cy.mount(<DefaultStateIcon state="error" />);
      cy.get(".uitkStateIcon").should("have.class", "uitkStateIcon-error");
      cy.get(".uitkStateIcon").should("have.attr", "aria-label", "error");
    });

    it("should render a success icon", () => {
      cy.mount(<DefaultStateIcon state="success" />);
      cy.get(".uitkStateIcon").should("have.class", "uitkStateIcon-success");
      cy.get(".uitkStateIcon").should(
        "have.attr",
        "aria-label",
        "success tick"
      );
    });

    it("should render a warning icon", () => {
      cy.mount(<DefaultStateIcon state="warning" />);
      cy.get(".uitkStateIcon").should("have.class", "uitkStateIcon-warning");
      cy.get(".uitkStateIcon").should("have.attr", "aria-label", "warning");
    });

    it("should render an info icon", () => {
      cy.mount(<DefaultStateIcon state="info" />);
      cy.get(".uitkStateIcon").should("have.class", "uitkStateIcon-info");
      cy.get(".uitkStateIcon").should("have.attr", "aria-label", "info");
    });
  });
});
