import { composeStories } from "@storybook/react";
import * as parentChildStories from "@stories/parent-child-layout/parent-child-layout.stories";

const composedStories = composeStories(parentChildStories);

const { Default } = composedStories;

describe("WHEN no gap values are provided", () => {
  it("THEN it should display a gap by default", () => {
    cy.mount(<Default />);

    cy.get(".saltParentChildLayout").should("have.css", "gap", "0px");
  });
});

describe("WHEN collapsableAtbreakpoint is provided", () => {
  it(
    "THEN it should be uncollapsed when the current breakpoint is greater than the target breakpoint",
    { viewportHeight: 900, viewportWidth: 1920 },
    () => {
      cy.mount(<Default collapseAtBreakpoint="lg" />);
      cy.get(".saltParentChildLayout-collapsed").should("not.be.visible");
    }
  );

  it(
    "THEN it should be collapsed when the current breakpoint less than or equal to the target breakpoint",
    { viewportHeight: 900, viewportWidth: 1280 },
    () => {
      cy.mount(<Default collapseAtBreakpoint="lg" />);
      cy.get(".saltParentChildLayout-collapsed").should("be.visible");
    }
  );
});

describe("WHEN collapsable", () => {
  it(
    "THEN it should display the Child by default",
    { viewportHeight: 900, viewportWidth: 600 },
    () => {
      cy.mount(<Default />);

      cy.get(".saltParentChildLayout-collapsed").should(($div) => {
        expect($div).to.contain("Child");
      });
    }
  );

  it(
    "THEN it should display the Parent component when passed as the collapsedViewProp",
    { viewportHeight: 900, viewportWidth: 600 },
    () => {
      cy.mount(<Default collapsedView="parent" />);

      cy.get(".saltParentChildLayout-collapsed").should(($div) => {
        expect($div).to.contain("Parent");
      });
    }
  );
});
