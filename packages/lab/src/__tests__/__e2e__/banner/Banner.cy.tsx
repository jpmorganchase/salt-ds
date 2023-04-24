import { Banner } from "@salt-ds/lab";
import { Link } from "@salt-ds/core";
import { composeStories } from "@storybook/testing-react";
import * as bannerStories from "@stories/banner/banner.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(bannerStories);
const { Statuses } = composedStories;

describe("GIVEN a Banner", () => {
  checkAccessibility(composedStories);

  it("THEN should render status", () => {
    cy.mount(<Statuses />);

    cy.findByTestId("InfoSolidIcon").should("exist");
    cy.findByTestId("SuccessTickIcon").should("exist");
    cy.findByTestId("WarningSolidIcon").should("exist");
    cy.findByTestId("ErrorSolidIcon").should("exist");
  });

  it("THEN should announce the contents of the Banner", () => {
    const message = "example announcement";
    cy.mount(<Banner>{message}</Banner>);

    cy.get("[aria-live]").contains(message);
  });

  it("THEN should call onClose when interacted with", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<Banner onClose={clickSpy}>On Close example</Banner>);
    cy.realPress("Tab");
    cy.realPress("Enter");
    cy.get("@clickSpy").should("be.called");
    cy.realPress("Space");
    cy.get("@clickSpy").should("be.called");
  });

  describe("WHEN using additional LinkProps", () => {
    it("THEN they should be applied", () => {
      cy.mount(
        <Banner>
          Default Banner State <Link href="some-link">Go to Dashboard</Link>
        </Banner>
      );

      cy.findByText("Link").should("not.exist");
      cy.findByText("Go to Dashboard").should("exist");
    });
  });

  describe("WHEN emphasize={true}", () => {
    it("THEN class should be applied to the banner", () => {
      cy.mount(
        <Banner data-testid="bannerRoot" emphasize={true}>
          Default Banner State
        </Banner>
      );

      cy.findByTestId("bannerRoot").should(
        "have.class",
        "saltBanner-emphasize"
      );
    });
  });
});
