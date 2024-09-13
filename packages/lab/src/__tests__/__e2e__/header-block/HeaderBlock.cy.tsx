import * as headerBlockStories from "@stories/header-block/header-block.stories";
import { composeStories } from "@storybook/react";
import { HeaderBlock } from "../../../header-block";

import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(headerBlockStories);

describe("GIVEN a HeaderBlock", () => {
  checkAccessibility(composedStories);

  it("should render the header text", () => {
    const TestComponent = <HeaderBlock header="HeaderBlock title" />;

    cy.mount(TestComponent);
    cy.findByText("HeaderBlock title").should("be.visible");
  });

  it("should render the preheader text when provided", () => {
    const TestComponent = (
      <HeaderBlock
        header="HeaderBlock title"
        preheader="This is a preheader."
      />
    );

    cy.mount(TestComponent);
    cy.findByText("This is a preheader.").should("be.visible");
  });

  it("should render the description text when provided", () => {
    const TestComponent = (
      <HeaderBlock
        header="HeaderBlock title"
        description="This is a description."
      />
    );

    cy.mount(TestComponent);
    cy.findByText("This is a description.").should("be.visible");
  });
});
