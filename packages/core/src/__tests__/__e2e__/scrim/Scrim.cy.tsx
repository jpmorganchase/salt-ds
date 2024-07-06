import { composeStories } from "@storybook/react";
import * as scrimStories from "@stories/scrim/scrim.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { Scrim } from "../../../scrim";

const composedStories = composeStories(scrimStories);
const { WithSpinner } = composedStories;

describe("Given a Scrim", () => {
  checkAccessibility({ WithSpinner });

  describe("Test Scrim interactions", () => {
    it("should render children when open", () => {
      cy.mount(<Scrim open>Click to close Scrim</Scrim>);
      cy.findByText("Click to close Scrim").should("exist");
    });

    it("should call `onClick` handler if set", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<Scrim onClick={clickSpy} open />);
      cy.findByTestId("scrim").click();
      cy.get("@clickSpy").should("have.callCount", 1);
    });
  });

  describe("Test Scrim variants", () => {
    it("should render primary scrim by default", () => {
      cy.mount(<Scrim open>Click to close Scrim</Scrim>);
      cy.get(".saltScrim").should("have.class", "saltScrim-primary");
      cy.get(".saltScrim").should("not.have.class", "saltScrim-secondary");
    });

    it("should render primary scrim with variant prop", () => {
      cy.mount(<Scrim open variant={"primary"}>Click to close Scrim</Scrim>);
      cy.get(".saltScrim").should("have.class", "saltScrim-primary");
      cy.get(".saltScrim").should("not.have.class", "saltScrim-secondary");
    });

    it("should render secondary scrim with variant prop", () => {
      cy.mount(<Scrim open variant={"secondary"}>Click to close Scrim</Scrim>);
      cy.get(".saltScrim").should("have.class", "saltScrim-secondary");
      cy.get(".saltScrim").should("not.have.class", "saltScrim-primary");
    });
  });
});
