import { composeStories } from "@storybook/testing-react";
import * as tabsStories from "@stories/tabs-next/tabs-next.stories";

const { Default: DefaultTabs } = composeStories(tabsStories);

describe("Given a Tabs", () => {
  describe("WHEN uncontrolled", () => {
    describe("WHEN no defaultActiveTabIndex is provided", () => {
      it("THEN first tab is selected", () => {
        cy.mount(<DefaultTabs width={400} />);
        cy.findAllByRole("tab")
          .eq(0)
          .should("have.attr", "aria-selected", "true");
        cy.findByText("Content for Home tab");
      });
    });
    describe("WHEN a defaultActiveTabIndex is provided", () => {
      it("THEN the defaultActiveTabIndex is selected", () => {
        cy.mount(<DefaultTabs defaultSelectedTab="Transactions" width={400} />);
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");
        cy.findByText("Content for Transactions tab");
      });
    });
    describe("WHEN defaultActiveTabIndex is null", () => {
      it("THEN first tab is selected", () => {
        // @ts-expect-error
        cy.mount(<DefaultTabs width={400} defaultSelectedTab={null} />);
        cy.findAllByRole("tab")
          .eq(0)
          .should("have.attr", "aria-selected", "true");
        cy.findByText("Content for Home tab");
      });
    });
  });
  describe("WHEN controlled", () => {
    describe("WHEN a selectedTab is provided", () => {
      it("THEN the selectedTab is selected", () => {
        cy.mount(<DefaultTabs selectedTab="Transactions" width={400} />);
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");
        cy.findByText("Content for Transactions tab");
      });
    });
    describe("WHEN a onSelectTab is provided", () => {
      it("THEN the selectedTab is selected", () => {
        cy.mount(
          <DefaultTabs
            onSelectTab={cy.spy().as("onSelectTab")}
            selectedTab="Transactions"
            width={400}
          />
        );
        cy.findAllByRole("tab")
          .eq(1)
          .should("have.attr", "aria-selected", "true");
        cy.findByText("Content for Transactions tab");
        cy.findAllByRole("tab").eq(0).click();

        cy.get("@onSelectTab")
          .should("have.been.calledOnce")
          .should("have.been.calledWith", Cypress.sinon.match.any, "Home");
      });
    });
  });
});
