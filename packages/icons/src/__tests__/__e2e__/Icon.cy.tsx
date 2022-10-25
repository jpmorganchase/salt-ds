import { composeStories } from "@storybook/testing-react";
import * as iconStory from "../../../stories/icon.stories";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(iconStory);
const { CustomSVGIcon } = composedStories;

describe("Given an icon", () => {
  checkAccessibility(composedStories);

  it("should render", () => {
    cy.mount(<CustomSVGIcon />);
    cy.get(".uitkIcon-small").find("svg").should("have.css", "width", "12px");
    cy.get(".uitkIcon-medium").find("svg").should("have.css", "width", "24px");
    cy.get(".uitkIcon-large").find("svg").should("have.css", "width", "48px");
  });
});
