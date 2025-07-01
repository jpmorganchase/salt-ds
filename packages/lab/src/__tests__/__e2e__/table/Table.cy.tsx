import * as tableStories from "@stories/table/table.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(tableStories);
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
const { Primary, Secondary, Tertiary } = composedStories;

describe("GIVEN a Table", () => {
  checkAccessibility(composedStories);

  it("THEN should render all rows and columns", () => {
    cy.mount(<Primary />);

    cy.findByText("Column 0").should("exist");
    cy.findByText("Column 1").should("exist");
    cy.findByText("Column 6").should("exist");
    cy.findByText("Column 7").should("not.exist");

    cy.findAllByText("Row 0").should("exist");
    cy.findAllByText("Row 1").should("exist");
    cy.findAllByText("Row 9").should("exist");
    cy.findAllByText("Row 10").should("not.exist");
  });

  describe("WHEN variant=secondary", () => {
    it("THEN class should be applied to the banner", () => {
      cy.mount(<Secondary data-testid="tableSecondary" />);

      cy.findByTestId("tableSecondary").should(
        "have.class",
        "saltTable-secondary",
      );
    });
  });

  describe("WHEN variant=tertiary", () => {
    it("THEN class should be applied to the banner", () => {
      cy.mount(<Tertiary data-testid="tableTertiary" />);

      cy.findByTestId("tableTertiary").should(
        "have.class",
        "saltTable-tertiary",
      );
    });
  });
});
