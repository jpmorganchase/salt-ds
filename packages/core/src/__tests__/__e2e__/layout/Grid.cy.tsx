import { composeStories } from "@storybook/testing-react";
import * as gridStories from "@stories/layout/grid-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";

const composedStories = composeStories(gridStories);
const {
  ToolkitGridLayout,
  ToolkitGridLayoutMultipleRows,
  ToolkitGridLayoutResponsiveView,
  GridLayoutNested,
} = composedStories;

const testElementsNumber = (elements: number) =>
  new RegExp(`^(\\d*\\.?\\d*px *){${elements}}$`);

describe("GIVEN a Grid", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should render 12 columns and 1 row", () => {
      cy.mount(<ToolkitGridLayout />);

      cy.get(".uitkGridLayout")
        .invoke("css", "grid-template-columns")
        .should("match", testElementsNumber(12));

      cy.get(".uitkGridLayout")
        .invoke("css", "grid-template-rows")
        .should("match", testElementsNumber(1));
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<ToolkitGridLayout />);

      cy.get(".uitkGridLayout").should("have.css", "column-gap", "24px");

      cy.get(".uitkGridLayout").should("have.css", "row-gap", "24px");
    });
    it("THEN nested items should not inherit css variables from parent", () => {
      cy.mount(<GridLayoutNested />);

      cy.get(".uitkGridLayout").eq(0).should("have.css", "column-gap", "48px");
      cy.get(".uitkGridLayout")
        .eq(0)
        .invoke("css", "grid-template-columns")
        .should("match", testElementsNumber(2));
      cy.get(".uitkGridLayout")
        .eq(0)
        .invoke("css", "grid-template-rows")
        .should("match", testElementsNumber(2));

      cy.get(".uitkGridLayout").eq(1).should("have.css", "column-gap", "24px");
      cy.get(".uitkGridLayout")
        .eq(1)
        .invoke("css", "grid-template-columns")
        .should("match", testElementsNumber(12));
      cy.get(".uitkGridLayout")
        .eq(1)
        .invoke("css", "grid-template-rows")
        .should("match", testElementsNumber(1));
    });
  });

  describe("WHEN column and row values are provided", () => {
    const columns = 4;
    const rows = 3;

    it("THEN it should render multiple columns and rows", () => {
      cy.mount(<ToolkitGridLayoutMultipleRows columns={columns} rows={rows} />);

      cy.get(".uitkGridLayout")
        .invoke("css", "grid-template-columns")
        .should("match", testElementsNumber(columns));

      cy.get(".uitkGridLayout")
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
        cy.mount(
          <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(12));

        cy.get(".uitkGridLayout")
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
        cy.mount(
          <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(12));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(4));
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
          .should("match", testElementsNumber(2));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(2));
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

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(1));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(4));
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
          .should("match", testElementsNumber(12));

        cy.get(".uitkGridLayout")
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
          <ToolkitProvider breakpoints={breakpoints}>
            <ToolkitGridLayoutResponsiveView columns={columns} rows={rows} />
          </ToolkitProvider>
        );

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(12));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(4));
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
          .should("match", testElementsNumber(2));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(2));
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

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-columns")
          .should("match", testElementsNumber(1));

        cy.get(".uitkGridLayout")
          .invoke("css", "grid-template-rows")
          .should("match", testElementsNumber(4));
      }
    );
  });
});
