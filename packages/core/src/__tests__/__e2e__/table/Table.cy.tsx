import * as tableStories from "@stories/table/table.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tableStories);
const {
  ScrollableVertically,
  ScrollableLabelIdTable,
  ScrollableLabelTable,
  ScrollableCaptionTable,
  NonScrollableTable,
  ScrollableUserLabelOverride,
  ScrollableUserLabelIdOverride,
} = composedStories;

describe("GIVEN a Table", () => {
  checkAccessibility(composedStories);
});

describe("GIVEN a Table inside a TableContainer", () => {
  it("THEN should have region role, be focusable and have accessible name when scrollable", () => {
    cy.mount(<ScrollableVertically />);

    cy.findByRole("table", { name: "Scrollable vertically" }).should(
      "be.visible",
    );

    cy.findByRole("region", { name: "Scrollable vertically" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Scrollable vertically" }).should(
      "have.focus",
    );
  });

  it("THEN should have accessible name when scrollable and caption is used", () => {
    cy.mount(<ScrollableCaptionTable />);

    cy.findByRole("table", { name: "Caption Name" }).should("be.visible");

    cy.findByRole("region", { name: "Caption Name" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Caption Name" }).should("have.focus");
  });

  it("THEN should have accessible name when scrollable and aria-label is used", () => {
    cy.mount(<ScrollableLabelTable />);

    cy.findByRole("table", { name: "Aria Labelled Table" }).should(
      "be.visible",
    );
    cy.findByRole("region", { name: "Scrollable Aria Labelled Table" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Scrollable Aria Labelled Table" }).should(
      "have.focus",
    );
  });

  it("THEN should have accessible name when scrollable and aria-labelledby is used", () => {
    cy.mount(<ScrollableLabelIdTable />);

    cy.findByRole("table", { name: "Labelled Table Name" }).should(
      "be.visible",
    );
    cy.findByRole("region", { name: "Labelled Table Name" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");
  });

  it("THEN should respect user provided aria-label override", () => {
    cy.mount(<ScrollableUserLabelOverride />);

    cy.findByRole("region", { name: "User provided region label" })
      .should("be.visible")
      .and("have.attr", "aria-label", "User provided region label");

    cy.findByRole("table", { name: "Default container label" }).should(
      "be.visible",
    );
  });

  it("THEN should respect user provided aria-labelledby override", () => {
    cy.mount(<ScrollableUserLabelIdOverride />);

    cy.findByRole("region", { name: "User provided labelled-by text" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");
  });

  it("THEN should not have region role or be focusable when not scrollable", () => {
    cy.mount(<NonScrollableTable />);

    cy.get('[role="region"]').should("have.length", 0);

    cy.findByTestId("non-scrollable-container").as("container");

    cy.get("@container").should(($el) => {
      expect($el).to.be.visible;
      expect($el).not.to.have.attr("tabindex");
      expect($el).not.to.have.attr("role");
      expect($el).not.to.have.attr("aria-labelledby");
      expect($el).not.to.have.attr("aria-label");
    });

    cy.realPress("Tab");
    cy.get("@container").should("not.have.focus");
  });
});
