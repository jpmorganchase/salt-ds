import * as tableStories from "@stories/table/table.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tableStories);
const {
  Primary,
  ColumnHeaders,
  ScrollableVertically,
  ScrollableAriaLabelTable,
  ScrollableExternalLabelTable,
  ScrollableIdOverride,
  ScrollableAriaLabelledByOverride,
  ScrollableContainerAriaLabelOverride,
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
    cy.mount(<Primary />);

    cy.findByRole("table", { name: "Sample data table" }).should("be.visible");

    cy.findByRole("region", { name: "Sample data table" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Sample data table" }).should("have.focus");
  });

  it("THEN should have accessible name when scrollable and aria-label is used", () => {
    cy.mount(<ScrollableAriaLabelTable />);

    cy.findByRole("table", { name: "Aria Label Table" }).should("be.visible");

    cy.findByRole("region", { name: "Aria Label Table" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Aria Label Table" }).should("have.focus");
  });

  it("THEN should have accessible name when scrollable and aria-labelledby is used", () => {
    cy.mount(<ScrollableExternalLabelTable />);

    cy.findByRole("table", { name: "External Table Name" }).should(
      "be.visible",
    );

    cy.findByRole("region", { name: "External Table Name" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "External Table Name" }).should(
      "have.focus",
    );
  });

  it("THEN should not have region role or be focusable when not scrollable", () => {
    cy.mount(<ColumnHeaders />);

    cy.findByRole("table", { name: "Column headers" }).should("be.visible");

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

  describe("AND user provided aria attributes or id", () => {
    it("THEN should prioritize user provided id on the table", () => {
      cy.mount(<ScrollableIdOverride />);

      cy.findByRole("table", { name: "Caption Name" })
        .should("be.visible")
        .and("have.attr", "id", "user-provided-id");

      cy.findByRole("region", { name: "Caption Name" }).should("be.visible");

      cy.realPress("Tab");
      cy.findByRole("region", { name: "Caption Name" }).should("have.focus");
    });

    it("THEN should prioritize user provided aria-labelledby on the table container", () => {
      cy.mount(<ScrollableAriaLabelledByOverride />);

      cy.findByRole("table", { name: "External Table Name" }).should(
        "be.visible",
      );

      cy.findByRole("region", {
        name: "External Table Container Name",
      })
        .should("be.visible")
        .and("have.attr", "aria-labelledby", "user-provided-aria-labelledby");

      cy.realPress("Tab");
      cy.findByRole("region").should("have.focus");
    });

    it("THEN should prioritize user provided aria-label on the table container", () => {
      cy.mount(<ScrollableContainerAriaLabelOverride />);

      cy.findByRole("table", { name: "Caption Name" }).should("be.visible");

      cy.findByRole("region", {
        name: "User Provided Aria Label",
      })
        .should("be.visible")
        .and("have.attr", "aria-label", "User Provided Aria Label");

      cy.realPress("Tab");
      cy.findByRole("region", {
        name: "User Provided Aria Label",
      }).should("have.focus");
    });
  });
});
