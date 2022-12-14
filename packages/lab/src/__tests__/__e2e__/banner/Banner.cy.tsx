import { Banner } from "@salt-ds/lab";
import { composeStories } from "@storybook/testing-react";
import * as bannerStories from "@stories/banner.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(bannerStories);
const { Info, Success, Warning, Error } = composedStories;

describe("GIVEN a Banner", () => {
  checkAccessibility(composedStories);

  it("THEN should render info", () => {
    cy.mount(<Info />);

    cy.findByTestId("InfoSolidIcon").should("exist");
  });

  it("THEN should render success", () => {
    cy.mount(<Success />);

    cy.findByTestId("SuccessTickIcon").should("exist");
  });

  it("THEN should render warning", () => {
    cy.mount(<Warning />);

    cy.findByTestId("WarningSolidIcon").should("exist");
  });

  it("THEN should render error", () => {
    cy.mount(<Error />);

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
        <Banner LinkProps={{ href: "some-link", children: "Go to Dashboard" }}>
          Default Banner State
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
        "uitkBanner-emphasize"
      );
    });
  });
});
