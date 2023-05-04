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

describe("WHEN adding BannerCloseButton", () => {
  beforeEach(() => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<Banner onClose={clickSpy}>On Close example</Banner>);
  });
  it("THEN should show the close button", () => {
    cy.get(".saltBanner").should("exist");
    cy.findByRole("button").should("exist");
  });

  it("THEN should close the banner on CLICK", () => {
    cy.get(".saltBanner").should("exist");
    cy.findByRole("button").realClick();
    cy.get(".saltBanner").should("not.exist");
  });

  it("THEN should close the banner on ENTER", () => {
    cy.get(".saltBanner").should("exist");
    cy.realPress("Tab");
    cy.realPress("Enter");
    cy.get("@clickSpy").should("be.called");
    cy.get(".saltBanner").should("not.exist");
  });

  it("THEN should close the banner on SPACE", () => {
    cy.get(".saltBanner").should("exist");
    cy.realPress("Tab");
    cy.realPress("Space");
    cy.get("@clickSpy").should("be.called");
    cy.get(".saltBanner").should("not.exist");
  });
});
