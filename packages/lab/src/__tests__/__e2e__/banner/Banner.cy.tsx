import { Banner, BannerCloseButton, BannerContent } from "@salt-ds/lab";
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
    cy.mount(
      <Banner>
        <BannerContent>{message}</BannerContent>
      </Banner>
    );

    cy.get("[aria-live]").contains(message);
  });

  describe("WHEN emphasize={true}", () => {
    it("THEN class should be applied to the banner", () => {
      cy.mount(
        <Banner data-testid="bannerRoot" emphasize={true}>
          <BannerContent> Default Banner State</BannerContent>
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
  it("THEN should show the close button and should call onClick handler on CLICK, ENTER and SPACE", () => {
    const clickSpy = cy.stub().as("clickSpy");
    const Component = (
      <Banner>
        <BannerContent>On Close example</BannerContent>
        <BannerCloseButton onClick={clickSpy} />
      </Banner>
    );
    cy.mount(Component);
    cy.get(".saltBanner").should("exist");
    cy.findByRole("button").should("exist");
    cy.findByRole("button").realClick();
    cy.get("@clickSpy").should("be.called");

    cy.mount(Component);
    cy.get(".saltBanner").should("exist");
    cy.realPress("Tab");
    cy.realPress("Enter");
    cy.get("@clickSpy").should("be.called");

    cy.mount(Component);
    cy.get(".saltBanner").should("exist");
    cy.realPress("Tab");
    cy.realPress("Space");
    cy.get("@clickSpy").should("be.called");
  });
});
