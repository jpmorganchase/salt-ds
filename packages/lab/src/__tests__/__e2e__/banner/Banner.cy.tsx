import { Banner } from "@jpmorganchase/uitk-lab";
import { composeStories } from "@storybook/testing-react";
import * as bannerStories from "@stories/banner.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(bannerStories);
const { Info, Success, Warning, Error } = composedStories;

describe("GIVEN a Banner", () => {
  checkAccessibility(composedStories);

  it("THEN should render info", () => {
    cy.mount(<Info />);

    cy.findByTestId("InfoIcon").should("exist");
  });

  it("THEN should render success", () => {
    cy.mount(<Success />);

    cy.findByTestId("SuccessTickIcon").should("exist");
  });

  it("THEN should render warning", () => {
    cy.mount(<Warning />);

    cy.findByTestId("WarningIcon").should("exist");
  });

  it("THEN should render error", () => {
    cy.mount(<Error />);

    cy.findByTestId("ErrorIcon").should("exist");
  });

  it("THEN should announce the contents of the Banner", () => {
    const message = "example announcement";
    cy.mount(<Banner>{message}</Banner>);

    cy.get("[aria-live]").contains(message);
  });
});
