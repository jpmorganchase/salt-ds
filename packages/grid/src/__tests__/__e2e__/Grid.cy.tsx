import { composeStories } from "@storybook/testing-react";
import * as gridStories from "@stories/grid.stories";
import { RowSelectionModesExample } from "@stories/examples";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(gridStories);
const { GridExample, LotsOfColumns, SingleRowSelect, SmallGrid } =
  composedStories;

const findCell = (row: number, col: number) => {
  return cy.get(`td[data-row-index="${row}"][data-column-index="${col}"]`);
};

const clickCell = (row: number, col: number) => {
  findCell(row, col).click({ force: true });
};

const checkRowSelected = (row: number, expectedSelected: boolean) => {
  cy.get(`tr[data-row-index="${row}"]`).should(
    expectedSelected ? "have.class" : "not.have.class",
    "uitkGridTableRow-selected"
  );
};

const resizeColumn = (col: number, dx: number) => {
  cy.findByTestId(`column-${col}-resize-handle`).then(($el) => {
    const { x, y } = $el[0].getBoundingClientRect();
    console.log(x, y);
    cy.findByTestId(`column-${col}-resize-handle`)
      .trigger("mousedown", "topLeft")
      .trigger("mousemove", { screenX: x + dx, screenY: y })
      .trigger("mouseup");
  });
};

const expectFakeColumnWidth = (w: number) => {
  cy.findByTestId(`grid-fake-column-header`).should(($el) => {
    expect($el[0].getBoundingClientRect().width).equal(w);
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

    clickCell(5, 1);
    checkRowSelected(5, true);
    clickCell(7, 2);
    checkRowSelected(5, false);
    checkRowSelected(7, true);
  });

  it("Multi-row selection mode", () => {
    cy.mount(<GridExample />);
    findCell(2, 3).click({ force: true });
    findCell(10, 2).click({ force: true, shiftKey: true });
    checkRowSelected(2, true);
    checkRowSelected(10, true);
    checkRowSelected(7, true);
    checkRowSelected(1, false);
    checkRowSelected(11, false);
    findCell(4, 2).click({ force: true, ctrlKey: true });
    checkRowSelected(2, true);
    checkRowSelected(4, false);
    checkRowSelected(5, true);
  });

  it("Column resize", () => {
    cy.mount(<LotsOfColumns />);
    resizeColumn(2, 100);
    findCell(3, 2).should(($el) => {
      expect($el[0].getBoundingClientRect().width).equal(160);
    });
  });

  it("Fake column", () => {
    cy.mount(<SmallGrid />);
    expectFakeColumnWidth(220);
    resizeColumn(1, -10);
    expectFakeColumnWidth(230);
    resizeColumn(2, -10);
    expectFakeColumnWidth(240);
  });

  it("Dropdown editor", () => {
    cy.mount(<GridExample />);
    findCell(0, 2).dblclick({ force: true });
    cy.findByTestId("grid-cell-editor-trigger")
      .should("exist")
      .type("{downArrow}")
      .type("{Enter}");
    findCell(0, 2).should("have.text", "Jersey City, NJ");
  });

  it("Numeric cell editor", () => {
    cy.mount(<GridExample />);
    findCell(0, 4).dblclick({ force: true });
    cy.findByTestId("grid-cell-editor-input")
      .should("exist")
      .type("3.1415")
      .type("{Enter}");
    findCell(0, 4).should("have.text", "3.14");
  });

  describe("Switching selection modes", () => {
    it("Shows correct columns", () => {
      cy.mount(<RowSelectionModesExample />);

      cy.findByLabelText("multi").click();
      cy.findAllByTestId("grid-row-selection-checkbox").should(
        "have.length",
        5
      );
      cy.findAllByTestId("grid-row-selection-radiobox").should(
        "have.length",
        0
      );
      cy.findAllByTestId("column-header").should("have.length", 4);
      cy.findAllByTestId("column-header").eq(0).should("have.text", "A");
      cy.findAllByTestId("column-header").eq(1).should("have.text", "B");
      cy.findAllByTestId("column-header").eq(2).should("have.text", "C");
      cy.findAllByTestId("column-header").eq(3).should("have.text", "");

      cy.findByLabelText("single").click();
      cy.findAllByTestId("grid-row-selection-radiobox").should(
        "have.length",
        5
      );
      cy.findAllByTestId("grid-row-selection-checkbox").should(
        "have.length",
        0
      );
      cy.findAllByTestId("column-header").should("have.length", 4);
      cy.findAllByTestId("column-header").eq(0).should("have.text", "A");
      cy.findAllByTestId("column-header").eq(1).should("have.text", "B");
      cy.findAllByTestId("column-header").eq(2).should("have.text", "C");
      cy.findAllByTestId("column-header").eq(3).should("have.text", "");

      cy.findByLabelText("none").click();
      cy.findAllByTestId("grid-row-selection-checkbox").should(
        "have.length",
        0
      );
      cy.findAllByTestId("grid-row-selection-radiobox").should(
        "have.length",
        0
      );
      cy.findAllByTestId("column-header").should("have.length", 3);
      cy.findAllByTestId("column-header").eq(0).should("have.text", "A");
      cy.findAllByTestId("column-header").eq(1).should("have.text", "B");
      cy.findAllByTestId("column-header").eq(2).should("have.text", "C");
    });

    it("Selects rows correctly", () => {
      cy.mount(<RowSelectionModesExample />);

      cy.findByLabelText("multi").click();
      findCell(2, 3).click({ force: true });
      findCell(3, 3).click({ force: true, shiftKey: true });
      checkRowSelected(2, true);
      checkRowSelected(3, true);

      cy.findByLabelText("single").click();
      findCell(2, 3).click({ force: true });
      findCell(3, 3).click({ force: true, shiftKey: true });
      checkRowSelected(2, false);
      checkRowSelected(3, true);

      cy.findByLabelText("none").click();
      findCell(2, 2).click({ force: true });
      findCell(3, 2).click({ force: true, shiftKey: true });
      checkRowSelected(2, false);
      checkRowSelected(3, false);
    });
  });

  // TODO column drag-n-drop
  // TODO clipboard
});
