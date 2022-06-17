import { composeStories } from "@storybook/testing-react";
import * as stackStories from "@stories/layout/split-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(stackStories);
const { DefaultSplitLayout } = composedStories;

describe("GIVEN a Split", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should wrap by default", () => {
      cy.mount(<DefaultSplitLayout />);

      cy.get(".uitkSplitLayout").should("have.css", "flex-wrap", "wrap");
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<DefaultSplitLayout />);

      cy.get(".uitkSplitLayout").should("have.css", "column-gap", "24px");

      cy.get(".uitkSplitLayout").should("have.css", "row-gap", "24px");
    });
  });

  describe("WHEN left and right content is provided", () => {
    const leftItemContent = ["Item 1", "Item 2"];
    const rightItemContent = ["Item 3", "Item 4"];

    const leftItem = (
      <>
        <div>{leftItemContent[0]}</div>
        <div>{leftItemContent[1]}</div>
      </>
    );

    const rightItem = (
      <>
        <div>{rightItemContent[0]}</div>
        <div>{rightItemContent[1]}</div>
      </>
    );

    it("THEN it should render as expected", () => {
      cy.mount(
        <DefaultSplitLayout
          leftSplitItem={leftItem}
          rightSplitItem={rightItem}
        />
      );

      cy.get(".uitkSplitLayout")
        .children()
        .first()
        .should("have.text", leftItemContent.join(""));

      cy.get(".uitkSplitLayout")
        .children()
        .last()
        .should("have.text", rightItemContent.join(""));
    });
  });

  describe("WHEN passing an array as the left item", () => {
    const leftItem = ["Item 1", "Item 2"];

    it("THEN it should render as expected", () => {
      cy.mount(<DefaultSplitLayout leftSplitItem={leftItem} />);

      cy.get(".uitkSplitLayout")
        .children()
        .first()
        .should("have.text", leftItem.join(""));
    });
  });

  describe("WHEN passing an array as the right item", () => {
    const rightItem = ["Item 3", "Item 4"];

    it("THEN it should render as expected", () => {
      cy.mount(<DefaultSplitLayout rightSplitItem={rightItem} />);

      cy.get(".uitkSplitLayout")
        .children()
        .last()
        .should("have.text", rightItem.join(""));
    });
  });

  describe("WHEN passing the gap prop", () => {
    it("THEN it should render with a new gap value", () => {
      cy.mount(<DefaultSplitLayout gap={2} />);

      cy.get(".uitkSplitLayout").should("have.css", "column-gap", "16px");

      cy.get(".uitkSplitLayout").should("have.css", "row-gap", "16px");
    });
  });
});
