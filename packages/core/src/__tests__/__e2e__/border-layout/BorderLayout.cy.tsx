import { BORDER_POSITION as borderAreas } from "@salt-ds/core";
import * as borderStories from "@stories/border-layout/border-layout.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(borderStories);
const { AllPanels, NoHeaderOrFooter } = composedStories;

describe("GIVEN a Border", () => {
  checkAccessibility(composedStories);

  describe("WHEN border items are provided", () => {
    it("THEN it should render them in the right positions", () => {
      cy.mount(<AllPanels />);

      cy.get(".saltBorderLayout").should(
        "have.css",
        "grid-template-areas",
        '"north north north" "west center east" "south south south"',
      );

      cy.get(".saltBorderLayout > .saltBorderItem").then((items) => {
        Array.from(items).forEach((item, index) => {
          cy.wrap(item).should(
            "have.css",
            "grid-column-start",
            borderAreas[index],
          );

          cy.wrap(item).should(
            "have.css",
            "grid-column-end",
            borderAreas[index],
          );

          cy.wrap(item).should(
            "have.css",
            "grid-row-start",
            borderAreas[index],
          );

          cy.wrap(item).should("have.css", "grid-row-end", borderAreas[index]);
        });
      });
    });
  });

  describe("WHEN no gap values are provided", () => {
    it("THEN it should not display a gap by default", () => {
      cy.mount(<AllPanels />);

      cy.get(".saltBorderLayout").should("have.css", "column-gap", "0px");

      cy.get(".saltBorderLayout").should("have.css", "row-gap", "0px");
    });
  });

  describe("WHEN the north and south regions are omitted", () => {
    it("THEN it should collapse to a single content row", () => {
      cy.mount(<NoHeaderOrFooter />);

      cy.get(".saltBorderLayout").should(
        "have.css",
        "grid-template-areas",
        '"west center east"',
      );
    });
  });
});
