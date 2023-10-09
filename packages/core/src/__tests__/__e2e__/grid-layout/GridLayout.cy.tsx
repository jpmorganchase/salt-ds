import { composeStories } from "@storybook/react";
import * as gridStories from "@stories/grid-layout/grid-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { SaltProvider } from "@salt-ds/core";

const composedStories = composeStories(gridStories);
const { Default, Nested } = composedStories;

const testElementsNumber = (elements: number) =>
  new RegExp(`^(\\d*\\.?\\d*px *){${elements}}$`);

describe("GIVEN a Grid", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should render 12 columns and 1 row", () => {
      // Passing empty columns to test default, as example needs columns for accessibility purposes.
      cy.mount(<Default columns={{}} />);

      cy.get(".saltGridLayout")
        .invoke("css", "grid-template-columns")
        .should("match", testElementsNumber(12));

      cy.get(".saltGridLayout")
        .invoke("css", "grid-template-rows")
        .should("match", testElementsNumber(1));
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<Default />);

      cy.get(".saltGridLayout").should("have.css", "column-gap", "24px");

      cy.get(".saltGridLayout").should("have.css", "row-gap", "24px");
    });
    it("THEN nested items should not inherit css variables from parent", () => {
      cy.mount(<Nested />);

      cy.get(".saltGridLayout").eq(0).should("have.css", "column-gap", "48px");
      cy.get(".saltGridLayout")
        .eq(0)
        .invoke("css", "grid-template-columns")
        .should("match", testElementsNumber(2));
      cy.get(".saltGridLayout")
        .eq(0)
        .invoke("css", "grid-template-rows")
        .should("match", testElementsNumber(1));

      cy.get(".saltGridLayout").eq(1).should("have.css", "column-gap", "24px");
      cy.get(".saltGridLayout")
        .eq(1)
        .invoke("css", "grid-template-columns")
        .should("match", testElementsNumber(1));
      cy.get(".saltGridLayout")
        .eq(1)
        .invoke("css", "grid-template-rows")
        .should("match", testElementsNumber(2));
    });
  });

  describe("WHEN column and row values are provided", () => {
    const columns = 4;
    const rows = 3;

    it("THEN it should render multiple columns and rows", () => {
      cy.mount(<Default columns={columns} rows={rows} />);

      cy.get(".saltGridLayout")
        .invoke("css", "grid-template-columns")
        .should("match", testElementsNumber(columns));

      cy.get(".saltGridLayout")
        .invoke("css", "grid-template-rows")
        .should("match", testElementsNumber(rows));
    });
  });

  describe("WHEN responsive values are provided", () => {
    const columns = { xs: 1, sm: 2, md: 12, lg: 12, xl: 12 };
    const rows = { xs: 4, sm: 2, md: 4, lg: 1, xl: 1 };

    it(
      "THEN it should render 12 columns and 1 row on xl viewport",
      {
        viewportHeight: 900,
        viewportWidth: 1921,
      },
      () => {
        cy.mount(<Default columns={columns} rows={rows} />);

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(12));

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(1));
      }
    );

    it(
      "THEN it should render 12 columns and 4 rows on md viewport",
      {
        viewportHeight: 900,
        viewportWidth: 961,
      },
      () => {
        cy.mount(<Default columns={columns} rows={rows} />);

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(12));

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(4));
      }
    );

    it(
      "THEN it should render 2 columns and 6 rows on sm viewport",
      {
        viewportHeight: 900,
        viewportWidth: 700,
      },
      () => {
        cy.mount(<Default columns={columns} rows={rows} />);

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(2));

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(6));
      }
    );

    it(
      "THEN it should render 1 column and 12 rows on xs viewport",
      {
        viewportHeight: 900,
        viewportWidth: 600,
      },
      () => {
        cy.mount(<Default columns={columns} rows={rows} />);

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(1));

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(12));
      }
    );
  });

  describe("WHEN custom breakpoints are provided", () => {
    const columns = { xs: 1, sm: 2, md: 12, lg: 12, xl: 12 };
    const rows = { xs: 4, sm: 2, md: 4, lg: 1, xl: 1 };

    const breakpoints = {
      xs: 0,
      sm: 500,
      md: 860,
      lg: 1180,
      xl: 1820,
    };

    it(
      "THEN it should render 12 columns and 1 row on xl viewport",
      {
        viewportHeight: 900,
        viewportWidth: 1821,
      },
      () => {
        cy.mount(
          <SaltProvider breakpoints={breakpoints}>
            <Default columns={columns} rows={rows} />
          </SaltProvider>
        );

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(12));

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(1));
      }
    );

    it(
      "THEN it should render 12 columns and 4 rows on md viewport",
      {
        viewportHeight: 900,
        viewportWidth: 1101,
      },
      () => {
        cy.mount(
          <SaltProvider breakpoints={breakpoints}>
            <Default columns={columns} rows={rows} />
          </SaltProvider>
        );

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(12));

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(4));
      }
    );

    it(
      "THEN it should render 2 columns and 6 rows on sm viewport",
      {
        viewportHeight: 900,
        viewportWidth: 741,
      },
      () => {
        cy.mount(
          <SaltProvider breakpoints={breakpoints}>
            <Default columns={columns} rows={rows} />
          </SaltProvider>
        );

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(2));

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(6));
      }
    );

    it(
      "THEN it should render 1 column and 12 rows on xs viewport",
      {
        viewportHeight: 900,
        viewportWidth: 499,
      },
      () => {
        cy.mount(
          <SaltProvider breakpoints={breakpoints}>
            <Default columns={columns} rows={rows} />
          </SaltProvider>
        );

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(1));

        cy.get(".saltGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(12));
      }
    );
  });
});
