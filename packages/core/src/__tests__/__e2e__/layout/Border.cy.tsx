import { composeStories } from "@storybook/testing-react";
import * as borderStories from "@stories/layout/border-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { BORDER_POSITION as borderAreas } from "../../../layout/BorderItem";

const composedStories = composeStories(borderStories);
const { ToolkitBorderLayout } = composedStories;

describe("GIVEN a Border", () => {
  // TODO: Fix accessibility issues in AppHeader
  // checkAccessibility(composedStories);

  describe("WHEN border items are provided", () => {
    it("THEN it should render them in the right positions", () => {
      cy.mount(<ToolkitBorderLayout />);

      cy.get(".uitkBorderLayout").should(
        "have.css",
        "grid-template-areas",
        '"header header header" "left main right" "bottom bottom bottom"'
      );

      cy.get(".uitkBorderLayout > .uitkBorderItem").then((items) => {
        Array.from(items).forEach((item, index) => {
          cy.wrap(item).should(
            "have.css",
            "grid-column-start",
            borderAreas[index]
          );

          cy.wrap(item).should(
            "have.css",
            "grid-column-end",
            borderAreas[index]
          );

          cy.wrap(item).should(
            "have.css",
            "grid-row-start",
            borderAreas[index]
          );

          cy.wrap(item).should("have.css", "grid-row-end", borderAreas[index]);
        });
      });
    });
  });

  describe("WHEN no gap values are provided", () => {
    it("THEN it should not display a gap by default", () => {
      cy.mount(<ToolkitBorderLayout />);

      cy.get(".uitkBorderLayout").should("have.css", "column-gap", "0px");

      cy.get(".uitkBorderLayout").should("have.css", "row-gap", "0px");
    });
  });
});
