import * as tableStories from "@stories/table/table.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tableStories);
const {
  StickyHeaderFooter,
  ScrollableVertically,
  ScrollableAriaLabelledByTable,
  ScrollableAriaLabelTable,
  ScrollableCaptionTable,
  NonScrollableTable,
} = composedStories;

describe("GIVEN a Table", () => {
  checkAccessibility(composedStories);

  it.only("THEN should render all rows and columns", () => {
    cy.mount(<StickyHeaderFooter />);

    cy.findAllByRole("rowgroup").eq(0).should("be.visible");
    cy.findAllByRole("rowgroup").eq(2).should("be.visible");

    cy.findAllByRole("rowgroup").eq(1).realMouseWheel({ deltaY: 300 });

    cy.findAllByRole("rowgroup").eq(0).should("be.visible");
    cy.findAllByRole("rowgroup").eq(2).should("be.visible");
  });
});

describe("GIVEN a Table inside a TableContainer", () => {
  it("THEN TableContainer should have region role, be focusable and have accessible name when scrollable", () => {
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

  it("THEN TableContainer should have accessible name when scrollable and caption is used", () => {
    cy.mount(<ScrollableCaptionTable />);

    cy.findByRole("table", { name: "Caption Name" }).should("be.visible");

    cy.findByRole("region", { name: "Caption Name" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Caption Name" }).should("have.focus");
  });

  it("THEN TableContainer should have accessible name when scrollable and aria-label is used", () => {
    cy.mount(<ScrollableAriaLabelTable />);

    cy.findByRole("table", { name: "Aria Label Name" }).should("be.visible");
    cy.findByRole("region", { name: "Aria Label Name" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");

    cy.realPress("Tab");
    cy.findByRole("region", { name: "Aria Label Name" }).should("have.focus");
  });

  it("THEN TableContainer should have accessible name when scrollable and aria-labelledby is used", () => {
    cy.mount(<ScrollableAriaLabelledByTable />);

    cy.findByRole("table", { name: "Labelled Table Name" }).should(
      "be.visible",
    );
    cy.findByRole("region", { name: "Labelled Table Name" })
      .should("be.visible")
      .and("have.attr", "tabindex", "0");
  });

  it("THEN TableContainer should not have region role or be focusable when not scrollable", () => {
    cy.mount(<NonScrollableTable />);

    cy.findAllByRole("region").should("have.length", 0);
    cy.findByTestId("non-scrollable-container")
      .should("not.have.attr", "tabindex")
      .and("not.have.attr", "role")
      .and("not.have.attr", "aria-labelledby");

    cy.realPress("Tab");
    cy.findByTestId("non-scrollable-container").should("not.have.focus");
  });
});
