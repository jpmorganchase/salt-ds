import { composeStories } from "@storybook/testing-react";
import * as gridStories from "@stories/grid.stories";
import * as gridEditableStories from "@stories/grid-editableCells.stories";
import { GridVariants } from "@stories/grid-variants.stories";
import { RowSelectionModes } from "@stories/grid-rowSelectionModes.stories";
import { RowSelectionControlled } from "@stories/grid-rowSelectionControlled.stories";
import { CellCustomization } from "@stories/grid-cellCustomization.stories";
import * as groupedStories from "@stories/grid-columnGroups.stories";
import { Grid, GridColumn, ColumnGroup } from "@jpmorganchase/uitk-grid";

const composedStories = composeStories(gridStories);
const composedEditableStories = composeStories(gridEditableStories);
const {
  GridExample,
  LotsOfColumns,
  SingleRowSelect,
  SmallGrid,
  LotsOfColumnGroups,
} = composedStories;
const { EditableCells } = composedEditableStories;
const { ColumnGroups } = composeStories(groupedStories);
const findCell = (row: number, col: number) => {
  return cy.get(`td[data-row-index="${row}"][data-column-index="${col}"]`);
};

const assertGridReady = () =>
  cy
    .get(`[aria-rowindex="1"] [aria-colindex="1"]`)
    .should("have.attr", "tabindex", "0");

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

const checkCursorPos = (row: number, col: number) => {
  cy.focused()
    .closest("[aria-colindex]")
    .should("have.attr", "aria-colindex", String(col + 1));

  cy.focused()
    .closest("[aria-rowindex]")
    .should("have.attr", "aria-rowindex", String(row + 1));
};

describe("Grid", () => {
  it("Rendering", () => {
    cy.mount(<GridExample />);
    cy.findByTestId("grid-middle-part").should("exist");
    cy.findByTestId("grid-top-part").should("exist");
  });

  it("Assigns correct aria-colindex to grouped column headers", () => {
    type GridData = { a: string; b: string; c: string; id: string };
    cy.mount(
      <Grid
        rowData={[{ id: "0", a: "a0", b: "b0", c: "c0" }]}
        rowKeyGetter={(r) => r.id}
        className="grid-column-groups"
      >
        <ColumnGroup name="Group One" id="group_one">
          <GridColumn id="a" name="A" getValue={(r: GridData) => r.a} />
          <GridColumn id="b" name="B" getValue={(r: GridData) => r.b} />
        </ColumnGroup>
        <ColumnGroup name="Group Two" id="group_two">
          <GridColumn id="c" name="C" getValue={(r: GridData) => r.c} />
        </ColumnGroup>
      </Grid>
    );

    assertGridReady();

    cy.get(".uitkGridTopPart thead tr")
      .eq(0)
      .find("th")
      .eq(0)
      .should("have.attr", "aria-colindex", "1")
      .should("have.attr", "aria-colspan", "2");
    cy.get(".uitkGridTopPart thead tr")
      .eq(1)
      .find("th")
      .eq(0)
      .should("have.attr", "aria-colindex", "1");

    cy.get(".uitkGridTopPart thead tr")
      .eq(0)
      .find("th")
      .eq(1)
      .should("have.attr", "aria-colindex", "3")
      .should("have.attr", "aria-colspan", "1");
    cy.get(".uitkGridTopPart thead tr")
      .eq(1)
      .find("th")
      .eq(2)
      .should("have.attr", "aria-colindex", "3");
  });

  it("Column virtualization", () => {
    cy.mount(<LotsOfColumns />);
    cy.findByTestId("grid-middle-part")
      .find(".uitkGridTableRow")
      .should("exist")
      .findAllByRole("gridcell")
      .should("have.length", 16);

    cy.findByTestId("grid-scrollable")
      .should("exist")
      .scrollTo(150, 0, { easing: "linear", duration: 100 })
      .then(() => {
        const getCol = (n: number) =>
          cy
            .findByTestId("grid-middle-part")
            .find(".uitkGridTableRow")
            .find(`[aria-colindex="${n + 1}"]`);

        // Columns A and B have widths of 60, they should be scrolled out
        getCol(0).should("not.exist");
        getCol(1).should("not.exist");
        // Column C is the first visible column now
        getCol(2).should("exist");
        // Column R is the last visible one
        getCol(18).should("exist");
        // Column S is out of view
        getCol(19).should("not.exist");
      });
  });

  it.skip("Row virtualization", () => {
    cy.mount(<LotsOfColumns />);

    cy.findByTestId("grid-scrollable")
      .scrollTo(0, 40, { easing: "linear", duration: 100 })
      .then(() => {
        const getRow = (n: number) =>
          cy
            .get("[data-testid='grid-middle-part']")
            .find(`[aria-rowindex="${n + 1}"]`);

        // Rows 1 to 15 should be rendered, everything above and below - not
        getRow(0).should("not.exist");
        getRow(1).should("exist");
        getRow(16).should("not.exist");
      });
  });

  it("Header virtualization in grouped mode", () => {
    cy.mount(<LotsOfColumnGroups />);
    cy.get(".uitkGridGroupHeaderCell").should("have.length", 4);

    cy.get(".uitkGridGroupHeaderCell").eq(0).should("have.text", "Group A");
    cy.get(".uitkGridGroupHeaderCell").eq(3).should("have.text", "Group D");
    cy.get(".uitkGridGroupHeaderCell").eq(4).should("not.exist");

    cy.findByTestId("grid-scrollable")
      .scrollTo(650, 0, { easing: "linear", duration: 300 })
      .then(() => {
        const getGroup = (n: number) =>
          cy
            .findByTestId("grid-top-part")
            .find(".uitkGridGroupHeaderRow")
            .find(`[data-group-index="${n}"]`);

        getGroup(0).should("not.exist");
        getGroup(1).should("not.exist");
        // Column C is the first visible column now after scroll
        getGroup(2).should("exist").should("have.text", "Group C");
        getGroup(3).should("exist");
        getGroup(4).should("exist");
        // Column F is the last visible one
        getGroup(5).should("exist").should("have.text", "Group F");
        getGroup(6).should("not.exist");
      });
  });

  it("Keyboard navigation", () => {
    cy.mount(<GridExample />);

    // we cannot test tabbing in cypress for now
    clickCell(0, 1);
    checkCursorPos(1, 1);

    cy.focused().realType("{rightarrow}");
    checkCursorPos(1, 2);
    cy.focused().realType("{downarrow}");
    checkCursorPos(2, 2);
    cy.focused().realType("{leftarrow}");
    checkCursorPos(2, 1);
    cy.focused().realType("{uparrow}");
    checkCursorPos(1, 1);
    cy.focused().realPress(["End"]);
    checkCursorPos(1, 5);
    cy.focused().realPress(["Home"]);
    checkCursorPos(1, 0);
    cy.focused().realPress(["ControlLeft", "End"]);
    checkCursorPos(42, 5);
    cy.focused().realPress(["ControlLeft", "Home"]);
    checkCursorPos(1, 0);
    cy.focused().realPress(["PageDown"]);
    checkCursorPos(14, 0);
    cy.focused().realPress(["PageUp"]);
    checkCursorPos(1, 0);
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

  it.skip("Dropdown editor", () => {
    cy.mount(<GridExample />);
    findCell(0, 2).dblclick({ force: true });
    cy.findByTestId("grid-cell-editor-trigger")
      .should("exist")
      .type("{downArrow}")
      .type("{Enter}");
    findCell(0, 2).should("have.text", "Jersey City, NJ");
  });

  it("Tabbing in and out of grid", () => {
    cy.mount(
      <>
        <button>button 1</button>
        <GridExample />
        <button>button 2</button>
      </>
    );

    assertGridReady();

    cy.findByText("button 1").focus();
    cy.realPress("Tab");
    checkCursorPos(0, 0);

    cy.focused().realPress("Tab");
    cy.focused().should("have.text", "button 2");
    cy.focused().realPress(["Shift", "Tab"]);

    checkCursorPos(0, 0);

    cy.focused().realPress(["Shift", "Tab"]);
    cy.focused().should("have.text", "button 1");
  });

  it("Backspace deletes cell value", () => {
    cy.mount(<EditableCells />);

    assertGridReady();
    clickCell(0, 0);
    cy.focused().realPress("Backspace");
    cy.findByTestId("grid-cell-editor-input")
      .should("exist")
      .should("have.value", "")
      .type("{Enter}");
    findCell(0, 0).should("have.text", "");
  });

  it("in edit mode Enter moves focus one row down", () => {
    cy.mount(<EditableCells />);

    assertGridReady();
    clickCell(0, 0);
    // immediately delete value in cell
    cy.focused().realPress("Enter");
    cy.findByTestId("grid-cell-editor-input").should("exist").type("{Enter}");

    // enter moves focus one cell down
    checkCursorPos(1, 0);
  });

  it("in edit mode Tab moves focus one column to the right", () => {
    cy.mount(<EditableCells />);

    assertGridReady();
    clickCell(0, 0);
    // immediately delete value in cell
    cy.focused().realPress("Enter");
    cy.findByTestId("grid-cell-editor-input").should("exist").realPress("Tab");

    // enter moves focus one cell down
    checkCursorPos(0, 1);
  });

  it("Numeric cell editor", () => {
    cy.mount(<GridExample />);

    clickCell(0, 4);
    cy.focused().realPress("Enter");
    cy.findByTestId("grid-cell-editor-input")
      .should("exist")
      .type("3.1415")
      .type("{Enter}");
    findCell(0, 4).should("have.text", "3.14");
  });

  // Docs Examples

  describe("Grid Variants", () => {
    it("displays 'Primary' variant by default", () => {
      cy.mount(<GridVariants />);
      cy.findByRole("grid")
        .should("have.class", "uitkGrid-primaryBackground")
        .and("not.have.class", "uitkGrid-secondaryBackground");
    });

    it("displays 'Secondary' variant", () => {
      cy.mount(<GridVariants />);
      cy.findByLabelText("secondary").click();
      cy.findByRole("grid").should(
        "have.class",
        "uitkGrid-secondaryBackground"
      );
    });

    it("displays 'Zebra' variant", () => {
      cy.mount(<GridVariants />);
      cy.findByLabelText("zebra").click();
      cy.findByRole("grid")
        .should("have.class", "uitkGrid-primaryBackground")
        .and("have.class", "uitkGrid-zebra");
    });
  });

  describe("Column Groups", () => {
    it("Shows correct groups", () => {
      cy.mount(<ColumnGroups />);
      cy.get(".uitkGridGroupHeaderCell")
        .eq(0)
        .should("have.attr", "colspan", 2)
        .and("have.text", "Group One");
      cy.get(".uitkGridGroupHeaderCell")
        .eq(1)
        .should("have.attr", "colspan", 1)
        .and("have.text", "Group Two");
    });
  });

  describe("Row Selection", () => {
    describe("Uncontrolled & switching selection modes", () => {
      it.skip("Shows correct columns", () => {
        cy.mount(<RowSelectionModes />);

        cy.findByLabelText("multi").click();
        cy.findAllByTestId("grid-row-selection-checkbox").should(
          "have.length",
          16
        );
        cy.findAllByTestId("grid-row-selection-radiobox").should(
          "have.length",
          0
        );
        cy.findAllByTestId("column-header").should("have.length", 4);
        cy.findAllByTestId("column-header").eq(1).should("have.text", "A");
        cy.findAllByTestId("column-header").eq(2).should("have.text", "B");
        cy.findAllByTestId("column-header").eq(3).should("have.text", "C");
        cy.findAllByTestId("column-header").eq(4).should("have.text", "");

        cy.findByLabelText("single").click();
        cy.findAllByTestId("grid-row-selection-radiobox").should(
          "have.length",
          16
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

      describe("Controlled Mode", () => {
        it("Handles controlled mode", () => {
          // This example used controlled selection mode to synchronise selection across two grids.
          cy.mount(<RowSelectionControlled />);

          // check both are all unselected
          cy.findAllByRole("grid").should("have.length", 2);
          cy.findAllByRole("grid")
            .findAllByTestId("grid-row-selection-checkbox")
            .should("not.have.class", "uitkGridTableRow-selected");

          // select two rows on the first grid
          cy.findAllByRole("grid")
            .eq(0)
            .findAllByTestId("grid-row-selection-checkbox")
            .eq(2)
            .click({ force: true });

          cy.findAllByRole("grid")
            .eq(0)
            .findAllByTestId("grid-row-selection-checkbox")
            .eq(3)
            .click({ force: true });

          // assert the second grid has the same rows selected
          cy.findAllByRole("grid")
            .eq(1)
            .get(`tr[data-row-index="2"]`)
            .should("have.class", "uitkGridTableRow-selected");

          cy.findAllByRole("grid")
            .eq(1)
            .get(`tr[data-row-index="3"]`)
            .should("have.class", "uitkGridTableRow-selected");
        });
      });
    });
  });

  describe("Cell Customisation", () => {
    it("Renders customised cell values", () => {
      cy.mount(<CellCustomization />);
      cy.get(".bidAskCellValue").should("have.length", 15);
      cy.get(".uitkLinearProgress").should("have.length", 15);
    });
  });

  describe("Switching selection modes", () => {
    it.skip("Shows correct columns", () => {
      cy.mount(<RowSelectionModes />);

      cy.findByLabelText("multi").click();
      cy.findAllByTestId("grid-row-selection-checkbox").should(
        "have.length",
        16
      );
      cy.findAllByTestId("grid-row-selection-radiobox").should(
        "have.length",
        0
      );
      cy.findAllByTestId("column-header").should("have.length", 4);
      cy.findAllByTestId("column-header").eq(1).should("have.text", "A");
      cy.findAllByTestId("column-header").eq(2).should("have.text", "B");
      cy.findAllByTestId("column-header").eq(3).should("have.text", "C");
      cy.findAllByTestId("column-header").eq(4).should("have.text", "");

      cy.findByLabelText("single").click();
      cy.findAllByTestId("grid-row-selection-radiobox").should(
        "have.length",
        16
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
      cy.mount(<RowSelectionModes />);

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

  it("Keyboard events should not leak to the parent component", () => {
    const onKeyDownSpy = cy.stub().as("onKeyDownSpy");
    cy.mount(
      <div onKeyDown={onKeyDownSpy}>
        <GridExample />
      </div>
    );
    clickCell(0, 1);
    cy.findByRole(`grid`).type("{rightArrow}");
    cy.findByRole(`grid`).type("{downArrow}");
    cy.findByRole(`grid`).type("{leftArrow}");
    cy.findByRole(`grid`).type("{upArrow}");
    cy.findByRole(`grid`).type("{end}");
    cy.findByRole(`grid`).type("{home}");
    cy.findByRole(`grid`).type(" ");
    cy.get("@onKeyDownSpy").should("not.have.been.called");
  });

  it("Space on checkbox column should toggle selection", () => {
    cy.mount(<RowSelectionModes />);

    cy.findByLabelText("multi").realClick();
    findCell(2, 1).click({ force: true });
    cy.focused().type("{downArrow}");
    cy.focused().type("{leftArrow}");
    // Space on any other cell would cancel the previous selection and select
    // the current row. Space on a checkbox cell should add the row to existing
    // selection.
    cy.focused().type(" ");
    checkRowSelected(2, true);
    checkRowSelected(3, true);
  });
});
