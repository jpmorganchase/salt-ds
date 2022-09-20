import { composeStories } from "@storybook/testing-react";
import * as buttonStories from "@stories/grid.stories";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(buttonStories);
const { GridExample, LotsOfColumns, SingleRowSelect } = composedStories;

const clickCell = (row: number, col: number) => {
  cy.get(`td[data-row-index="${row}"][data-column-index="${col}"]`).click({
    force: true,
  });
};

describe("Grid", () => {
  // TODO checkAccessibility(composedStories);

  it("Rendering", () => {
    cy.mount(<GridExample />);
    cy.findByTestId("grid-left-part").should("exist");
    cy.findByTestId("grid-middle-part").should("exist");
    cy.findByTestId("grid-right-part").should("exist");
    cy.findByTestId("grid-top-left-part").should("exist");
    cy.findByTestId("grid-top-right-part").should("exist");
  });

  it("Column virtualization", () => {
    cy.mount(<LotsOfColumns />);
    cy.findByTestId("grid-middle-part")
      .find(".uitkGridTableRow")
      .should("exist")
      .findAllByRole("gridcell")
      .should("have.length", 14);

    cy.findByTestId("grid-scrollable")
      .should("exist")
      .scrollTo(150, 0, { easing: "linear", duration: 100 })
      .then(() => {
        const getCol = (n: number) =>
          cy
            .findByTestId("grid-middle-part")
            .find(".uitkGridTableRow")
            .find(`[aria-colindex="${n}"]`);

        // Columns A and B have widths of 60, they should be scrolled out
        getCol(0).should("not.exist");
        getCol(1).should("not.exist");
        // Column C is the first visible column now
        getCol(2).should("exist");
        // Column P is the last visible one
        getCol(15).should("exist");
        // Column Q is out of view
        getCol(16).should("not.exist");
      });
  });

  it("Row virtualization", () => {
    cy.mount(<LotsOfColumns />);

    cy.findByTestId("grid-scrollable")
      .scrollTo(0, 40, { easing: "linear", duration: 100 })
      .then(() => {
        const getRow = (n: number) =>
          cy
            .findByTestId("grid-middle-part")
            .find("tbody")
            .find(`tr [data-row-index="${n}"]`);

        // Rows 1 to 15 should be rendered, everything above and below - not
        getRow(0).should("not.exist");
        getRow(1).should("exist");
        getRow(15).should("exist");
        getRow(16).should("not.exist");
      });
  });

  // TODO header virtualization in grouped mode

  it("Keyboard navigation", () => {
    cy.mount(<GridExample />);

    const checkCursorPos = (row: number, col: number) => {
      cy.findByTestId("grid-cell-focused")
        .should("have.attr", "data-column-index", String(col))
        .and("have.attr", "data-row-index", String(row));
    };

    clickCell(0, 1);

    cy.findByRole(`grid`).type("{rightArrow}");
    checkCursorPos(0, 2);
    cy.findByRole(`grid`).type("{downArrow}");
    checkCursorPos(1, 2);
    cy.findByRole(`grid`).type("{leftArrow}");
    checkCursorPos(1, 1);
    cy.findByRole(`grid`).type("{upArrow}");
    checkCursorPos(0, 1);
    cy.findByRole(`grid`).type("{end}");
    checkCursorPos(0, 5);
    cy.findByRole(`grid`).type("{home}");
    checkCursorPos(0, 0);
    cy.findByRole(`grid`).type("{ctrl}{end}");
    checkCursorPos(41, 5);
    cy.findByRole(`grid`).type("{ctrl}{home}");
    checkCursorPos(0, 0);
    // TODO other hotkeys
  });

  it("Single row selection mode", () => {
    cy.mount(<SingleRowSelect />);

    const checkRowSelected = (row: number, expectedSelected: boolean) => {
      cy.get(`tr[data-row-index="${row}"]`).should(
        expectedSelected ? "have.class" : "not.have.class",
        "uitkGridTableRow-selected"
      );
    };

    clickCell(5, 1);
    checkRowSelected(5, true);
    clickCell(7, 2);
    checkRowSelected(5, false);
    checkRowSelected(7, true);
  });

  // TODO multi-row selection mode
  // TODO column resize
  // TODO fake column
  // TODO column drag-n-drop
  // TODO zebra
  // TODO variants (primary/secondary)
  // TODO column separators
  // TODO density changes (including auto-size columns)
  // TODO auto scrollbars
  // TODO pinned columns
  // TODO editors
  // TODO clipboard
});
