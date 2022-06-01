import { composeStories } from "@storybook/testing-react";
import * as gridStories from "@stories/layout/grid-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";

const composedStories = composeStories(gridStories);
const {
  ToolkitGridLayout,
  ToolkitGridLayoutMultipleRows,
  ToolkitGridLayoutResponsiveView,
} = composedStories;

const testColumnsNumber = (columns: number) =>
  new RegExp(`^(\\d*\\.?\\d*px *){${columns}}$`);

describe("GIVEN a Grid", () => {
  checkAccessibility(composedStories);

  const columnsWidth = "102px ";
  const rowsHeight = "73px ";

  describe("WHEN no props are provided", () => {
    const columns = 12;
    const rows = 1;

    it("THEN it should render 12 columns and 1 row", () => {
      cy.mount(<ToolkitGridLayout />);

      cy.get(".uitkGridLayout").should(
        "have.css",
        "grid-template-columns",
        columnsWidth.repeat(columns).trim()
      );

      cy.get(".uitkGridLayout").should(
        "have.css",
        "grid-template-rows",
        rowsHeight.repeat(rows).trim()
      );
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<ToolkitGridLayout />);

      cy.get(".uitkGridLayout").should("have.css", "column-gap", "24px");

      cy.get(".uitkGridLayout").should("have.css", "row-gap", "24px");
    });
  });

  describe("WHEN column and row values are provided", () => {
    const columns = 4;
    const rows = 3;

    it("THEN it should render multiple columns and rows", () => {
      cy.mount(<ToolkitGridLayoutMultipleRows columns={columns} rows={rows} />);

      cy.get(".uitkGridLayout").should(
        "have.css",
        "grid-template-columns",
        columnsWidth.repeat(columns).trim()
      );

      cy.get(".uitkGridLayout").should(
        "have.css",
        "grid-template-rows",
        rowsHeight.repeat(rows).trim()
      );
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
        cy.mount(
          <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testColumnsNumber(12));

        cy.get(".uitkGridLayout").should(
          "have.css",
          "grid-template-rows",
          "232px"
        );
      }
    );

    it(
      "THEN it should render 12 columns and 4 rows on md viewport",
      {
        viewportHeight: 900,
        viewportWidth: 961,
      },
      () => {
        cy.mount(
          <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testColumnsNumber(12));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testColumnsNumber(4));
      }
    );

    it(
      "THEN it should render 2 columns and 2 rows on sm viewport",
      {
        viewportHeight: 900,
        viewportWidth: 700,
      },
      () => {
        cy.mount(
          <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testColumnsNumber(2));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testColumnsNumber(2));
      }
    );

    it(
      "THEN it should render 1 column and 4 rows on xs viewport",
      {
        viewportHeight: 900,
        viewportWidth: 600,
      },
      () => {
        cy.mount(
          <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
        );

        cy.get(".uitkGridLayout").should(
          "have.css",
          "grid-template-columns",
          "232px"
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testColumnsNumber(4));
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
          <ToolkitProvider breakpoints={breakpoints}>
            <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
          </ToolkitProvider>
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testColumnsNumber(12));

        cy.get(".uitkGridLayout").should(
          "have.css",
          "grid-template-rows",
          "232px"
        );
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
          <ToolkitProvider breakpoints={breakpoints}>
            <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
          </ToolkitProvider>
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testColumnsNumber(12));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testColumnsNumber(4));
      }
    );

    it(
      "THEN it should render 2 columns and 2 rows on sm viewport",
      {
        viewportHeight: 900,
        viewportWidth: 741,
      },
      () => {
        cy.mount(
          <ToolkitProvider breakpoints={breakpoints}>
            <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
          </ToolkitProvider>
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testColumnsNumber(2));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testColumnsNumber(2));
      }
    );

    it(
      "THEN it should render 1 column and 4 rows on xs viewport",
      {
        viewportHeight: 900,
        viewportWidth: 499,
      },
      () => {
        cy.mount(
          <ToolkitProvider breakpoints={breakpoints}>
            <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
          </ToolkitProvider>
        );

        cy.get(".uitkGridLayout").should(
          "have.css",
          "grid-template-columns",
          "232px"
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testColumnsNumber(4));
      }
    );
  });
});
