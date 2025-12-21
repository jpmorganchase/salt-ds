import * as tableStories from "@stories/table/table.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tableStories);
const { StickyHeaderFooter } = composedStories;

describe("GIVEN a Table", () => {
  checkAccessibility(composedStories);

  it("THEN should render all rows and columns", () => {
    cy.mount(<StickyHeaderFooter />);

    cy.findAllByRole("rowgroup").eq(0).should("be.visible");
    cy.findAllByRole("rowgroup").eq(2).should("be.visible");

    cy.findAllByRole("rowgroup").eq(1).realMouseWheel({ deltaY: 300 });

    cy.findAllByRole("rowgroup").eq(0).should("be.visible");
    cy.findAllByRole("rowgroup").eq(2).should("be.visible");
  });
});
