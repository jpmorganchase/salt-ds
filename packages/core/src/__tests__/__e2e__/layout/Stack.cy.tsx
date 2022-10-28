import { composeStories } from "@storybook/testing-react";
import * as stackStories from "@stories/layout/stack-layout.stories";

const { DefaultStackLayout } = composeStories(stackStories);

describe("GIVEN a Stack", () => {
  describe("WHEN no props are provided", () => {
    it("THEN it should not wrap by default", () => {
      cy.mount(<DefaultStackLayout />);

      cy.get(".uitkFlexLayout").should("have.css", "flex-wrap", "nowrap");
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<DefaultStackLayout />);

      cy.get(".uitkFlexLayout").should("have.css", "column-gap", "24px");

      cy.get(".uitkFlexLayout").should("have.css", "row-gap", "24px");
    });
  });

  describe("WHEN a separator value is provided", () => {
    it("THEN it should render a separator", () => {
      cy.mount(<DefaultStackLayout separators />);

      cy.get(".uitkFlexLayout").should(
        "have.class",
        "uitkFlexLayout-separator"
      );
    });
  });
});
