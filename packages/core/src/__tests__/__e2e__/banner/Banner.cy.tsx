import { Banner, BannerActions, BannerContent, Button } from "@salt-ds/core";
import { RefreshIcon } from "@salt-ds/icons";
import * as bannerStories from "@stories/banner/banner.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(bannerStories);
const { StatusesPrimary } = composedStories;

describe("GIVEN a Banner", () => {
  checkAccessibility(composedStories);

  it("THEN should render status", () => {
    cy.mount(<StatusesPrimary />);

    cy.findByRole("img", { name: "info" }).should("exist");
    cy.findByRole("img", { name: "success" }).should("exist");
    cy.findByRole("img", { name: "warning" }).should("exist");
    cy.findByRole("img", { name: "error" }).should("exist");
  });

  xit("THEN should announce the contents of the Banner", () => {
    const message = "example announcement";
    cy.mount(
      <Banner>
        <BannerContent>{message}</BannerContent>
      </Banner>,
    );

    cy.get("[aria-live]").contains(message);
  });

  describe("WHEN variant=secondary", () => {
    it("THEN class should be applied to the banner", () => {
      cy.mount(
        <Banner data-testid="bannerRoot" variant="secondary">
          <BannerContent> Default Banner State</BannerContent>
        </Banner>,
      );

      cy.findByTestId("bannerRoot").should(
        "have.class",
        "saltBanner-secondary",
      );
    });
  });
});

describe("WHEN adding BannerActions", () => {
  it("THEN should show the close button and should call onClick handler on CLICK, ENTER and SPACE", () => {
    const clickSpy = cy.stub().as("clickSpy");
    const Component = (
      <Banner>
        <BannerContent>On Close example</BannerContent>
        <BannerActions>
          <Button
            aria-label="refresh"
            appearance="transparent"
            onClick={clickSpy}
          >
            <RefreshIcon />
          </Button>
        </BannerActions>
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
