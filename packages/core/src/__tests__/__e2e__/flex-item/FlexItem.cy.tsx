import * as flexStories from "@stories/flex-item/flex-item.stories";
import { composeStories } from "@storybook/react";

const composedStories = composeStories(flexStories);
const { FlexItemWrapper } = composedStories;

describe("GIVEN a FlexItem in FlexLayout", () => {
  describe("WHEN no props are provided", () => {
    it("THEN it should render default flex properties", () => {
      cy.mount(<FlexItemWrapper />);

      cy.get(".saltFlexLayout > .saltFlexItem")
        .first()
        .should("have.css", "flex-grow", "0")
        .should("have.css", "flex-shrink", "1")
        .should("have.css", "flex-basis", "auto");
    });
  });

  describe("WHEN flex props are provided", () => {
    it("THEN it should render properties with overridden value", () => {
      cy.mount(<FlexItemWrapper grow={2} shrink={2} basis="100px" />);

      cy.get(".saltFlexLayout > .saltFlexItem")
        .first()
        .should("have.css", "flex-grow", "2")
        .should("have.css", "flex-shrink", "2")
        .should("have.css", "flex-basis", "100px");
    });
  });
});
