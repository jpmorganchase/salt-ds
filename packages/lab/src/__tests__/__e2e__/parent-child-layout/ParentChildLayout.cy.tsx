import { composeStories } from "@storybook/react";
import * as parentChildStories from "@stories/parent-child-layout/parent-child-layout.stories";
import { SaltProvider } from "@salt-ds/core";

const composedStories = composeStories(parentChildStories);

const { Default } = composedStories;

describe("GIVEN a ParentChildLAyout", () => {
  describe("WHEN no gap values are provided", () => {
    it("THEN it should display no gap by default", () => {
      cy.mount(<Default />);

      cy.get(".saltParentChildLayout").should("have.css", "gap", "0px");
    });
  });

  describe("WHEN collapseAtbreakpoint is provided", () => {
    it(
      "THEN it should be uncollapsed when the current breakpoint is greater than the target breakpoint",
      { viewportHeight: 900, viewportWidth: 1921 },
      () => {
        cy.mount(<Default collapseAtBreakpoint="lg" />);

        cy.get(".saltParentChildLayout").should(($div) => {
          expect($div).to.contain("Parent");
          expect($div).to.contain("Child");
        });
      }
    );

    it(
      "THEN it should be collapsed when the current breakpoint less than or equal to the target breakpoint",
      { viewportHeight: 900, viewportWidth: 1280 },
      () => {
        cy.mount(<Default collapseAtBreakpoint="lg" />);
        cy.get(".saltParentChildLayout").should(($div) => {
          expect($div).to.contain("Child");
        });
      }
    );
  });

  describe("WHEN custom breakpoints are provided", () => {
    it(
      "THEN it should be uncollapsed when the current breakpoint is greater than the target breakpoint",
      { viewportHeight: 900, viewportWidth: 1921 },
      () => {
        cy.mount(
          <SaltProvider
            breakpoints={{ xs: 0, sm: 960, md: 960, lg: 1800, xl: 1920 }}
          >
            <Default collapseAtBreakpoint="lg" />
          </SaltProvider>
        );

        cy.get(".saltParentChildLayout").should(($div) => {
          expect($div).to.contain("Parent");
          expect($div).to.contain("Child");
        });
      }
    );

    it(
      "THEN it should be collapsed when the current breakpoint is greater than the target breakpoint",
      { viewportHeight: 900, viewportWidth: 1800 },
      () => {
        cy.mount(
          <SaltProvider
            breakpoints={{ xs: 0, sm: 960, md: 960, lg: 1800, xl: 1920 }}
          >
            <Default collapseAtBreakpoint="lg" />
          </SaltProvider>
        );

        cy.get(".saltParentChildLayout").should(($div) => {
          expect($div).to.contain("Child");
        });
      }
    );
  });

  describe("WHEN collapsed", () => {
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
      "THEN it should display the Parent component when passed as the visibleViewProp",
      { viewportHeight: 900, viewportWidth: 600 },
      () => {
        cy.mount(<Default visibleView="parent" />);

        cy.get(".saltParentChildLayout-collapsed").should(($div) => {
          expect($div).to.contain("Parent");
        });
      }
    );
  });
});
