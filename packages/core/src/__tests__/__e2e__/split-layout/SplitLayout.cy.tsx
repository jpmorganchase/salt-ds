import { composeStories } from "@storybook/react";
import * as splitStories from "@stories/split-layout/split-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(splitStories);
const { Default } = composedStories;

describe("GIVEN a Split", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should not wrap before the default small breakpoint", () => {
      cy.mount(<Default />);

      cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "nowrap");
      cy.get(".saltFlexLayout").should("have.css", "flex-direction", "row");
    });

    it(
      "THEN it should wrap at the default small breakpoint",
      { viewportWidth: 599 },
      () => {
        cy.mount(<Default />);
        cy.get(".saltFlexLayout").should(
          "have.css",
          "flex-direction",
          "column"
        );
      }
    );

    it("THEN it should render with a default gap", () => {
      cy.mount(<Default />);

      cy.get(".saltFlexLayout").should("have.css", "column-gap", "24px");

      cy.get(".saltFlexLayout").should("have.css", "row-gap", "24px");
    });
  });

  describe("WHEN 2 children, left and right are provided", () => {
    const leftItemContent = ["Item 1", "Item 2"];
    const rightItemContent = ["Item 3", "Item 4"];

    const LeftItem = () => (
      <div>
        <div>{leftItemContent[0]}</div>
        <div>{leftItemContent[1]}</div>
      </div>
    );

    const RightItem = () => (
      <div>
        <div>{rightItemContent[0]}</div>
        <div>{rightItemContent[1]}</div>
      </div>
    );

    it("THEN it should render as expected", () => {
      cy.mount(<Default startItem={<LeftItem />} endItem={<RightItem />} />);

      cy.get(".saltFlexLayout")
        .children()
        .first()
        .should("have.text", leftItemContent.join(""));

      cy.get(".saltFlexLayout")
        .children()
        .last()
        .should("have.text", rightItemContent.join(""));
    });
  });

  describe("WHEN passing the gap prop", () => {
    it("THEN it should render with a new gap value", () => {
      cy.mount(<Default gap={2} />);

      cy.get(".saltFlexLayout").should("have.css", "column-gap", "16px");

      cy.get(".saltFlexLayout").should("have.css", "row-gap", "16px");
    });
  });
});
