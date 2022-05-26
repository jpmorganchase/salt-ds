import { composeStories } from "@storybook/testing-react";
import * as parentChildStories from "@stories/layout/parent-child-layout.stories";

const composedStories = composeStories(parentChildStories);

const { DefaultParentChildLayout, ToolkitParentChildLayoutStacked } =
  composedStories;

describe("GIVEN a Parent and Child", () => {
  describe("WHEN no gap values are provided", () => {
    it("THEN it should display a gap by default", () => {
      cy.mount(<DefaultParentChildLayout />);

      cy.get(".uitkParentChildLayout").should("have.css", "column-gap", "24px");

      cy.get(".uitkParentChildLayout").should("have.css", "row-gap", "24px");
    });
  });

  describe("WHEN passing an array as a parent", () => {
    const parent = ["a", "b", "c", "d", "e"];

    it("THEN it should render as expected", () => {
      cy.mount(<DefaultParentChildLayout parent={parent} />);

      cy.get(".uitkParentChildItem")
        .first()
        .should("have.text", parent.join(""));
    });
  });

  describe("WHEN passing an array as a child", () => {
    const child = ["a", "b", "c", "d", "e"];

    it("THEN it should render as expected", () => {
      cy.mount(<DefaultParentChildLayout child={child} />);

      // Make sure both child and parent are rendered before running next test `eq`
      cy.get(".uitkParentChildItem").should("have.length", 2);
      cy.get(".uitkParentChildItem").eq(1).should("have.text", child.join(""));
    });
  });

  describe("WHEN no stackedAtBreakpoint value is provided", () => {
    it(
      "THEN it should render both components on larger viewports",
      {
        viewportHeight: 900,
        viewportWidth: 1921,
      },
      () => {
        cy.mount(<DefaultParentChildLayout />);
        cy.get(".uitkParentChildItem").should("have.length", 2);
      }
    );

    it(
      "THEN it should render only one component on small viewports",
      {
        viewportHeight: 900,
        viewportWidth: 700,
      },
      () => {
        cy.mount(<DefaultParentChildLayout />);
        cy.get(".uitkParentChildItem").should("have.length", 1);
      }
    );
  });

  describe("WHEN in stacked view", () => {
    it("THEN it should only display the parent by default", () => {
      cy.mount(<ToolkitParentChildLayoutStacked />);

      cy.get(".uitkParentChildItem").should("have.length", 1);

      cy.get(".uitkParentChildItem > div").should(($div) => {
        expect($div).to.contain("Parent");
      });
    });

    it("THEN it should change to the child view when the button is clicked", () => {
      cy.mount(<ToolkitParentChildLayoutStacked />);

      cy.findByRole("button", { name: /Show child/i }).click();

      cy.get(".uitkParentChildItem").should("have.length", 1);

      cy.get(".uitkParentChildItem > div").should(($div) => {
        expect($div).to.contain("Child");
      });
    });

    it("THEN it should change the direction of animations", () => {
      cy.mount(<ToolkitParentChildLayoutStacked orientation="vertical" />);

      cy.get(".uitkParentChildItem").should(
        "have.class",
        "uitkParentChildItem-slide-bottom"
      );

      cy.mount(<ToolkitParentChildLayoutStacked orientation="horizontal" />);

      cy.get(".uitkParentChildItem").should(
        "have.class",
        "uitkParentChildItem-slide-left"
      );
    });
  });
});
