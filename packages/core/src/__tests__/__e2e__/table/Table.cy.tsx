import * as tableStories from "@stories/table/table.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tableStories);
const {
  ScrollableVertically,
  ScrollableAriaLabelTable,
  ScrollableExternalLableTable,
  ScrollableIdOverride,
  ScrollableAriaLabelledByOverride,
  ScrollableCaptionTable,
  NonScrollableTable,
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
    cy.mount(<ScrollableAriaLabelTable />);

    cy.findByRole("table", { name: "Aria Label Table" }).should("be.visible");

    cy.findByRole("region", { name: "Aria Label Table" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Aria Label Table" }).should("have.focus");
  });

  it("THEN should have accessible name when scrollable and aria-labelledby is used", () => {
    cy.mount(<ScrollableExternalLableTable />);

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

  it("THEN should use user provided id", () => {
    cy.mount(<ScrollableIdOverride />);

    cy.findByRole("table", { name: "Caption Name" })
      .should("be.visible")
      .and("have.attr", "id", "user-provided-id");

    cy.findByRole("region", { name: "Caption Name" }).should("be.visible");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Caption Name" }).should("have.focus");
  });

  it("THEN should use user provided aria-labelledby", () => {
    cy.mount(<ScrollableAriaLabelledByOverride />);

    cy.findByRole("table", { name: "External Table Name" }).should(
      "be.visible",
    );

    cy.findByRole("region")
      .should("be.visible")
      .and("have.attr", "aria-labelledby", "user-provided-aria-labelledby");

    cy.realPress("Tab");
    cy.findByRole("region").should("have.focus");
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
