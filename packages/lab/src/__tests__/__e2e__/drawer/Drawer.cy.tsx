import { composeStories } from "@storybook/testing-react";
import * as drawerStories from "@stories/drawer/drawer.stories";

const composedStories = composeStories(drawerStories);

const { Default, Top, Right, Bottom } = composedStories;

describe("GIVEN a Drawer", () => {
  describe("WHEN no props are provided", () => {
    it("THEN it should display an overlay by default", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer-overlay").should("be.visible");
    });

    it("THEN it should default to a left position", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.class", "saltDrawer-left");
    });

    it("THEN it should display animations by default", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.class", "saltDrawer-enterAnimation");
    });

    it("THEN it should display a primary variant by default", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.class", "saltDrawer-primary");
    });
  });

  describe("WHEN a position is provided", () => {
    it("THEN it should render on the left hand side", () => {
      cy.mount(<Default position="left" />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.class", "saltDrawer-left");
    });

    it("THEN it should render at the top", () => {
      cy.mount(<Top />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.css", "top", "0px");
    });

    it("THEN it should render on the right hand side", () => {
      cy.mount(<Right />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.css", "right", "0px");
    });

    it("THEN it should render at the bottom", () => {
      cy.mount(<Bottom />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.css", "bottom", "0px");
    });
  });

  describe("WHEN a drawer is open", () => {
    it("THEN it should be able to close", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.findByRole("dialog").should("be.visible");

      cy.findByLabelText("close").click();

      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should be able to close by clicking outside", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.findByRole("dialog").should("be.visible");

      cy.get(".saltDrawer-overlay").click();

      cy.findByRole("dialog").should("not.exist");
    });
  });

  describe("WHEN a variant is provided", () => {
    it("THEN it should display a primary variant", () => {
      cy.mount(<Default variant="primary" />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.class", "saltDrawer-primary");
    });

    it("THEN it should display a secondary variant", () => {
      cy.mount(<Default variant="secondary" />);

      cy.findByRole("button", { name: /Open Drawer/i }).click();

      cy.get(".saltDrawer").should("have.class", "saltDrawer-secondary");
    });
  });
});
