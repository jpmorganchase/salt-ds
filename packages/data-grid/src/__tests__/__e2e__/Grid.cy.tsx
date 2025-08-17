import * as gridStories from "@stories/grid.stories";
import * as cellCustomizationStories from "@stories/grid-cellCustomization.stories";
import * as cellValidationStories from "@stories/grid-cellValidation.stories";
import * as columnGroupsStories from "@stories/grid-columnGroups.stories";
import * as gridEditableStories from "@stories/grid-editableCells.stories";
import * as gridPaginationStories from "@stories/grid-pagination.stories";
import * as rowSelectionControlledStories from "@stories/grid-rowSelectionControlled.stories";
import * as rowSelectionModesStories from "@stories/grid-rowSelectionModes.stories";
import * as sortColumnsStories from "@stories/grid-sortColumns.stories";
import * as variantsStories from "@stories/grid-variants.stories";
import { composeStories } from "@storybook/react-vite";

const { GridVariants } = composeStories(variantsStories);
const { CellCustomization } = composeStories(cellCustomizationStories);
const { RowSelectionControlled } = composeStories(
  rowSelectionControlledStories,
);
const { GridPagination } = composeStories(gridPaginationStories);
const { RowSelectionModes } = composeStories(rowSelectionModesStories);
const { CellValidation, RowValidation } = composeStories(cellValidationStories);
const {
  GridExample,
  LotsOfColumns,
  SingleRowSelect,
  SmallGrid,
  LotsOfColumnGroups,
} = composeStories(gridStories);
const { EditableCells } = composeStories(gridEditableStories);
const { ColumnGroups } = composeStories(columnGroupsStories);
const { ServerSideSort } = composeStories(sortColumnsStories);

const findCell = (row: number, col: number) => {
  return cy.get(`td[data-row-index="${row}"][data-column-index="${col}"]`);
};

function checkAriaDescription(
  cell: Cypress.Chainable<JQuery<HTMLElement>>,
  desc: string,
) {
  cell.then(($el) => {
    cy.get(`#${$el.attr("aria-describedby")!}`).should("have.text", desc);
  });
}

const assertGridReady = () =>
  cy
    .get(`[aria-rowindex="1"] [aria-colindex="1"]`)
    .should("have.attr", "tabindex", "0");

const clickCell = (row: number, col: number) => {
  findCell(row, col).click({ force: true });
};

const checkRowSelected = (row: number, expectedSelected: boolean) => {
  if (expectedSelected) {
    return cy
      .get(`tr[data-row-index="${row}"]`)
      .should("have.attr", "aria-selected", "true");
  }
  return cy
    .get(`tr[data-row-index="${row}"]`)
    .should("not.have.attr", "aria-selected");
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
  cy.findByTestId("grid-fake-column-header").should(($el) => {
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
  // it("Rendering", () => {
  //   cy.mount(<GridExample />);
  //   cy.findByTestId("grid-middle-part").should("exist");
  //   cy.findByTestId("grid-top-part").should("exist");
  // });

  // it("Assigns correct aria-colindex to grouped column headers", () => {
  //   type GridData = { a: string; b: string; c: string; id: string };
  //   cy.mount(
  //     <Grid
  //       rowData={[{ id: "0", a: "a0", b: "b0", c: "c0" }]}
  //       rowKeyGetter={(r) => r.id}
  //       className="grid-column-groups"
  //     >
  //       <ColumnGroup name="Group One" id="group_one">
  //         <GridColumn id="a" name="A" getValue={(r: GridData) => r.a} />
  //         <GridColumn id="b" name="B" getValue={(r: GridData) => r.b} />
  //       </ColumnGroup>
  //       <ColumnGroup name="Group Two" id="group_two">
  //         <GridColumn id="c" name="C" getValue={(r: GridData) => r.c} />
  //       </ColumnGroup>
  //     </Grid>
  //   );

  //   assertGridReady();

  //   cy.get(".saltGridTopPart thead tr")
  //     .eq(0)
  //     .find("th")
  //     .eq(0)
  //     .should("have.attr", "aria-colindex", "1")
  //     .should("have.attr", "aria-colspan", "2");
  //   cy.get(".saltGridTopPart thead tr")
  //     .eq(1)
  //     .find("th")
  //     .eq(0)
  //     .should("have.attr", "aria-colindex", "1");

  //   cy.get(".saltGridTopPart thead tr")
  //     .eq(0)
  //     .find("th")
  //     .eq(1)
  //     .should("have.attr", "aria-colindex", "3")
  //     .should("have.attr", "aria-colspan", "1");
  //   cy.get(".saltGridTopPart thead tr")
  //     .eq(1)
  //     .find("th")
  //     .eq(2)
  //     .should("have.attr", "aria-colindex", "3");
  // });

  // it("Column virtualization", () => {
  //   cy.mount(<LotsOfColumns />);
  //   cy.findByTestId("grid-middle-part")
  //     .find(".saltGridTableRow")
  //     .should("exist")
  //     .findAllByRole("gridcell")
  //     .should("have.length", 16);

  //   cy.findByTestId("grid-scrollable")
  //     .should("exist")
  //     .scrollTo(150, 0, { easing: "linear", duration: 100 })
  //     .then(() => {
  //       const getCol = (n: number) =>
  //         cy
  //           .findByTestId("grid-middle-part")
  //           .find(".saltGridTableRow")
  //           .find(`[aria-colindex="${n + 1}"]`);

  //       // Columns A and B have widths of 60, they should be scrolled out
  //       getCol(0).should("not.exist");
  //       getCol(1).should("not.exist");
  //       // Column C is the first visible column now
  //       getCol(2).should("exist");
  //       // Column R is the last visible one
  //       getCol(18).should("exist");
  //       // Column S is out of view
  //       getCol(19).should("not.exist");
  //     });
  // });

  // it("Row virtualization", () => {
  //   cy.mount(<LotsOfColumns />);
  //   assertGridReady();
  //   cy.findByTestId("grid-scrollable").scrollTo(0, 50, {
  //     easing: "linear",
  //     duration: 100,
  //   });

  //   cy.findByTestId("grid-scrollable");

  //   const getRow = (n: number) =>
  //     cy
  //       .get("[data-testid='grid-middle-part']")
  //       .find(`[aria-rowindex="${n + 1}"]`);

  //   // Rows 1 to 14 should be rendered, everything above and below - not
  //   getRow(0).should("not.exist");
  //   getRow(1).should("exist");
  //   getRow(15).should("exist");
  //   // this will fail locally on a Mac because macs don't render scrollbars and therefore render an extra row
  //   getRow(16).should("not.exist");
  // });

  // it("Header virtualization in grouped mode", () => {
  //   cy.mount(<LotsOfColumnGroups />);
  //   cy.get(".saltGridGroupHeaderCell").should("have.length", 4);

  //   cy.get(".saltGridGroupHeaderCell").eq(0).should("have.text", "Group A");
  //   cy.get(".saltGridGroupHeaderCell").eq(3).should("have.text", "Group D");
  //   cy.get(".saltGridGroupHeaderCell").eq(4).should("not.exist");

  //   cy.findByTestId("grid-scrollable")
  //     .scrollTo(650, 0, { easing: "linear", duration: 300 })
  //     .then(() => {
  //       const getGroup = (n: number) =>
  //         cy
  //           .findByTestId("grid-top-part")
  //           .find(".saltGridGroupHeaderRow")
  //           .find(`[data-group-index="${n}"]`);

  //       getGroup(0).should("not.exist");
  //       getGroup(1).should("not.exist");
  //       // Column C is the first visible column now after scroll
  //       getGroup(2).should("exist").should("have.text", "Group C");
  //       getGroup(3).should("exist");
  //       getGroup(4).should("exist");
  //       // Column F is the last visible one
  //       getGroup(5).should("exist").should("have.text", "Group F");
  //       getGroup(6).should("not.exist");
  //     });
  // });

  // it("Keyboard navigation", () => {
  //   cy.mount(<GridExample />);

  //   // we cannot test tabbing in cypress for now
  //   clickCell(0, 1);
  //   checkCursorPos(1, 1);

  //   cy.focused().realType("{rightarrow}");
  //   checkCursorPos(1, 2);
  //   cy.focused().realType("{downarrow}");
  //   checkCursorPos(2, 2);
  //   cy.focused().realType("{leftarrow}");
  //   checkCursorPos(2, 1);
  //   cy.focused().realType("{uparrow}");
  //   checkCursorPos(1, 1);
  //   cy.focused().realPress(["End"]);
  //   checkCursorPos(1, 5);
  //   cy.focused().realPress(["Home"]);
  //   checkCursorPos(1, 0);
  //   cy.focused().realPress(["ControlLeft", "End"]);
  //   checkCursorPos(50, 5);
  //   cy.focused().realPress(["ControlLeft", "Home"]);
  //   checkCursorPos(1, 0);
  //   cy.focused().realPress(["PageDown"]);
  //   checkCursorPos(14, 0);
  //   cy.focused().realPress(["PageUp"]);
  //   checkCursorPos(1, 0);
  //   // TODO other hotkeys
  // });

  // it("Single row selection mode", () => {
  //   cy.mount(<SingleRowSelect />);

  //   clickCell(5, 1);
  //   checkRowSelected(5, true);
  //   clickCell(7, 2);
  //   checkRowSelected(5, false);
  //   checkRowSelected(7, true);
  // });

  // it("Multi-row selection mode", () => {
  //   cy.mount(<GridExample />);
  //   findCell(2, 3).click({ force: true });
  //   findCell(10, 2).click({ force: true, shiftKey: true });
  //   checkRowSelected(2, true);
  //   checkRowSelected(10, true);
  //   checkRowSelected(7, true);
  //   checkRowSelected(1, false);
  //   checkRowSelected(11, false);
  //   findCell(4, 2).click({ force: true, ctrlKey: true });
  //   checkRowSelected(2, true);
  //   checkRowSelected(4, false);
  //   checkRowSelected(5, true);
  // });

  // it("Column resize", () => {
  //   cy.mount(<LotsOfColumns />);
  //   resizeColumn(2, 100);
  //   findCell(3, 2).should(($el) => {
  //     expect($el[0].getBoundingClientRect().width).equal(160);
  //   });
  // });

  // it("Fake column", () => {
  //   cy.mount(<SmallGrid />);
  //   expectFakeColumnWidth(378);
  //   resizeColumn(1, -10);
  //   expectFakeColumnWidth(388);
  //   resizeColumn(2, -10);
  //   expectFakeColumnWidth(398);
  // });

  // it.skip("Dropdown editor", () => {
  //   cy.mount(<GridExample />);
  //   findCell(0, 2).dblclick({ force: true });
  //   cy.findByTestId("grid-cell-editor-trigger")
  //     .should("exist")
  //     .type("{downArrow}")
  //     .type("{Enter}");
  //   findCell(0, 2).should("have.text", "Jersey City, NJ");
  // });

  // it("Dropdown editor should close when selecting the same option", () => {
  //   cy.mount(<EditableCells />);

  //   assertGridReady();
  //   findCell(0, 3).dblclick({ force: true });
  //   cy.findByTestId("dropdown-list").should("be.visible");
  //   cy.findByRole("option", { name: "-" }).click();
  //   cy.findByTestId("dropdown-list").should("not.exist");
  // });

  // it("Tabbing in and out of grid", () => {
  //   cy.mount(
  //     <>
  //       <button>button 1</button>
  //       <GridExample />
  //       <button>button 2</button>
  //     </>
  //   );

  //   assertGridReady();

  //   cy.findByText("button 1").focus();
  //   cy.realPress("Tab");
  //   checkCursorPos(0, 0);

  //   cy.focused().realPress("Tab");
  //   cy.focused().should("have.text", "button 2");
  //   cy.focused().realPress(["Shift", "Tab"]);

  //   checkCursorPos(0, 0);

  //   cy.focused().realPress(["Shift", "Tab"]);
  //   cy.focused().should("have.text", "button 1");
  // });

  // it("Backspace deletes cell value", () => {
  //   cy.mount(<EditableCells />);

  //   assertGridReady();
  //   clickCell(0, 0);
  //   cy.focused().realPress("Backspace");
  //   cy.findByTestId("grid-cell-editor-input")
  //     .should("exist")
  //     .should("have.value", "")
  //     .type("{Enter}");
  //   findCell(0, 0).should("have.text", "");
  // });

  // it("in edit mode Enter moves focus one row down", () => {
  //   cy.mount(<EditableCells />);

  //   assertGridReady();
  //   clickCell(0, 0);
  //   // immediately delete value in cell
  //   cy.focused().realPress("Enter");
  //   cy.findByTestId("grid-cell-editor-input").should("exist").type("{Enter}");

  //   // enter moves focus one cell down
  //   checkCursorPos(1, 0);
  // });

  // it("in edit mode Tab moves focus one column to the right", () => {
  //   cy.mount(<EditableCells />);

  //   assertGridReady();
  //   clickCell(0, 0);
  //   // immediately delete value in cell
  //   cy.focused().realPress("Enter");
  //   cy.findByTestId("grid-cell-editor-input").should("exist").realPress("Tab");

  //   // enter moves focus one cell down
  //   checkCursorPos(0, 1);
  // });

  // it("Arbitrary typing on an editable cell enters edit mode with the first key as value", () => {
  //   cy.mount(<EditableCells />);

  //   assertGridReady();
  //   clickCell(0, 0);
  //   cy.focused().realType("a");
  //   cy.findByTestId("grid-cell-editor-input")
  //     .should("exist")
  //     .should("have.value", "a");
  // });

  // it("Escape cancels edit and reverts cell value", () => {
  //   cy.mount(<EditableCells />);

  //   assertGridReady();
  //   clickCell(0, 0);
  //   cy.focused().realPress("Enter");
  //   cy.focused().realType("asd");
  //   cy.findByTestId("grid-cell-editor-input")
  //     .should("exist")
  //     .should("have.value", "asd")
  //     .type("{Esc}");
  //   findCell(0, 0).should("not.have.text", "a");
  //   checkCursorPos(0, 0);
  // });

  // it("Numeric cell editor", () => {
  //   cy.mount(<GridExample />);

  //   clickCell(0, 4);
  //   cy.focused().realPress("Enter");
  //   cy.findByTestId("grid-cell-editor-input")
  //     .should("exist")
  //     .type("3.1415")
  //     .type("{Enter}");
  //   findCell(0, 4).should("have.text", "3.14");
  // });

  // it("Clicking on a different cell ends edit and confirms new cell value", () => {
  //   cy.mount(<EditableCells />);

  //   assertGridReady();
  //   clickCell(0, 0);
  //   cy.focused().realPress("Enter");
  //   cy.focused().realType("asd");
  //   cy.findByTestId("grid-cell-editor-input")
  //     .should("exist")
  //     .should("have.value", "asd");

  //   clickCell(0, 1);
  //   checkCursorPos(0, 1);
  //   findCell(0, 0).should("have.text", "asd");
  // });

  // it("Clicking on a header or outside the grid ends edit and confirms new cell value", () => {
  //   cy.mount(<EditableCells />);

  //   assertGridReady();
  //   clickCell(0, 0);
  //   cy.focused().realPress("Enter");
  //   cy.focused().realType("asd");
  //   cy.findByTestId("grid-cell-editor-input")
  //     .should("exist")
  //     .should("have.value", "asd");

  //   cy.get("body").click();
  //   findCell(0, 0).should("have.text", "asd");

  //   clickCell(0, 0);
  //   cy.focused().realPress("Enter");
  //   cy.focused().realType("qwe");
  //   cy.findByTestId("grid-cell-editor-input")
  //     .should("exist")
  //     .should("have.value", "qwe");

  //   cy.get(".saltGridTopPart").click();
  //   findCell(0, 0).should("have.text", "qwe");
  // });

  // // Docs Examples

  // describe("Grid Variants", () => {
  //   it("displays 'Primary' variant by default", () => {
  //     cy.mount(<GridVariants />);
  //     cy.findByRole("grid")
  //       .should("have.class", "saltGrid-primaryBackground")
  //       .and("not.have.class", "saltGrid-secondaryBackground");
  //   });

  //   it("displays 'Secondary' variant", () => {
  //     cy.mount(<GridVariants />);
  //     cy.findByRole("radio", { name: "Secondary" }).click();
  //     cy.findByRole("grid").should(
  //       "have.class",
  //       "saltGrid-secondaryBackground"
  //     );
  //   });

  //   it("displays 'Zebra' variant", () => {
  //     cy.mount(<GridVariants />);
  //     cy.findByRole("radio", { name: "Zebra" }).click();
  //     cy.findByRole("grid")
  //       .should("have.class", "saltGrid-primaryBackground")
  //       .and("have.class", "saltGrid-zebra");
  //   });
  // });

  // describe("Column Groups", () => {
  //   it("Shows correct groups", () => {
  //     cy.mount(<ColumnGroups />);
  //     cy.get(".saltGridGroupHeaderCell")
  //       .eq(0)
  //       .should("have.attr", "colspan", 2)
  //       .and("have.text", "Group One");
  //     cy.get(".saltGridGroupHeaderCell")
  //       .eq(1)
  //       .should("have.attr", "colspan", 1)
  //       .and("have.text", "Group Two");
  //   });
  // });

  // describe("Row Selection Controlled Mode", () => {
  //   it("Handles controlled mode", () => {
  //     // This example used controlled selection mode to synchronise selection across two grids.
  //     cy.mount(<RowSelectionControlled />);

  //     // check both are all unselected
  //     cy.findAllByRole("grid").should("have.length", 2);
  //     cy.findAllByRole("grid")
  //       .findAllByTestId("grid-row-selection-checkbox")
  //       .should("not.have.class", "saltGridTableRow-selected");

  //     // select two rows on the first grid
  //     cy.findAllByRole("grid")
  //       .eq(0)
  //       .findAllByTestId("grid-row-selection-checkbox")
  //       .eq(2)
  //       .click({ force: true });

  //     cy.findAllByRole("grid")
  //       .eq(0)
  //       .findAllByTestId("grid-row-selection-checkbox")
  //       .eq(3)
  //       .click({ force: true });

  //     // assert the second grid has the same rows selected
  //     cy.findAllByRole("grid")
  //       .eq(1)
  //       .get(`tr[data-row-index="2"]`)
  //       .should("have.class", "saltGridTableRow-selected");

  //     cy.findAllByRole("grid")
  //       .eq(1)
  //       .get(`tr[data-row-index="3"]`)
  //       .should("have.class", "saltGridTableRow-selected");
  //   });
  // });

  // describe("Cell Customisation", () => {
  //   it("Renders customised cell values", () => {
  //     cy.mount(<CellCustomization />);
  //     cy.get(".bidAskCellValue").should("have.length", 15);
  //     cy.get(".saltLinearProgress").should("have.length", 15);
  //   });
  // });

  // describe("Switching selection modes", () => {
  //   it("Shows correct columns", () => {
  //     cy.mount(<RowSelectionModes />);

  //     cy.findByRole("radio", { name: "Multi" }).click();
  //     cy.findAllByTestId("grid-row-selection-checkbox").should(
  //       "have.length",
  //       15
  //     );
  //     cy.findAllByTestId("grid-row-selection-radiobox").should(
  //       "have.length",
  //       0
  //     );
  //     cy.findAllByTestId("column-header").should("have.length", 4);
  //     cy.findAllByTestId("column-header").eq(1).should("have.text", "A");
  //     cy.findAllByTestId("column-header").eq(2).should("have.text", "B");
  //     cy.findAllByTestId("column-header").eq(3).should("have.text", "C");

  //     cy.findByRole("radio", { name: "Single" }).click();
  //     cy.findAllByTestId("grid-row-selection-radiobox").should(
  //       "have.length",
  //       15
  //     );
  //     cy.findAllByTestId("grid-row-selection-checkbox").should(
  //       "have.length",
  //       0
  //     );
  //     cy.findAllByTestId("column-header").should("have.length", 4);
  //     cy.findAllByTestId("column-header").eq(1).should("have.text", "A");
  //     cy.findAllByTestId("column-header").eq(2).should("have.text", "B");
  //     cy.findAllByTestId("column-header").eq(3).should("have.text", "C");

  //     cy.findByRole("radio", { name: "None" }).click();
  //     cy.findAllByTestId("grid-row-selection-checkbox").should(
  //       "have.length",
  //       0
  //     );
  //     cy.findAllByTestId("grid-row-selection-radiobox").should(
  //       "have.length",
  //       0
  //     );
  //     cy.findAllByTestId("column-header").should("have.length", 3);
  //     cy.findAllByTestId("column-header").eq(0).should("have.text", "A");
  //     cy.findAllByTestId("column-header").eq(1).should("have.text", "B");
  //     cy.findAllByTestId("column-header").eq(2).should("have.text", "C");
  //   });

  //   it("Selects rows correctly", () => {
  //     cy.mount(<RowSelectionModes />);

  //     cy.findByRole("radio", { name: "Multi" }).click();
  //     findCell(2, 3).click({ force: true });
  //     findCell(3, 3).click({ force: true, shiftKey: true });
  //     checkRowSelected(2, true);
  //     checkRowSelected(3, true);

  //     cy.findByRole("radio", { name: "Single" }).click();
  //     findCell(2, 3).click({ force: true });
  //     findCell(3, 3).click({ force: true, shiftKey: true });
  //     checkRowSelected(2, false);
  //     checkRowSelected(3, true);

  //     cy.findByRole("radio", { name: "None" }).click();
  //     findCell(2, 2).click({ force: true });
  //     findCell(3, 2).click({ force: true, shiftKey: true });
  //     checkRowSelected(2, false);
  //     checkRowSelected(3, false);
  //   });
  // });

  // it("Keyboard events should not leak to the parent component", () => {
  //   const onKeyDownSpy = cy.stub().as("onKeyDownSpy");
  //   cy.mount(
  //     <div onKeyDown={onKeyDownSpy}>
  //       <GridExample />
  //     </div>
  //   );
  //   clickCell(0, 1);
  //   cy.findByRole(`grid`).type("{rightArrow}");
  //   cy.findByRole(`grid`).type("{downArrow}");
  //   cy.findByRole(`grid`).type("{leftArrow}");
  //   cy.findByRole(`grid`).type("{upArrow}");
  //   cy.findByRole(`grid`).type("{end}");
  //   cy.findByRole(`grid`).type("{home}");
  //   cy.findByRole(`grid`).type(" ");
  //   cy.get("@onKeyDownSpy").should("not.have.been.called");
  // });

  // it("Space on checkbox column should toggle selection", () => {
  //   cy.mount(<RowSelectionModes />);

  //   cy.findByRole("radio", { name: "Multi" }).realClick();
  //   findCell(2, 1).click({ force: true });
  //   cy.focused().type("{downArrow}");
  //   cy.focused().type("{leftArrow}");
  //   // Space on any other cell would cancel the previous selection and select
  //   // the current row. Space on a checkbox cell should add the row to existing
  //   // selection.
  //   cy.focused().type(" ");
  //   checkRowSelected(2, true);
  //   checkRowSelected(3, true);
  // });

  // describe("Column Sorting", () => {
  //   xit("should sort column values when sorting is enabled", () => {
  //     cy.mount(<RowSelectionModes />);

  //     // first click: sort in ascending order
  //     cy.findByRole("columnheader", { name: "B" }).realClick();
  //     cy.findByRole("columnheader", { name: "B" }).should(
  //       "have.attr",
  //       "aria-sort",
  //       "ascending"
  //     );
  //     findCell(1, 2).should("have.text", "100.00");

  //     // second click: sort in descending order
  //     cy.findByRole("columnheader", { name: "B" }).realClick();
  //     cy.findByRole("columnheader", { name: "B" }).should(
  //       "have.attr",
  //       "aria-sort",
  //       "descending"
  //     );
  //     findCell(1, 2).should("have.text", "4800.00");

  //     // third click: back to default order without sorting
  //     cy.findByRole("columnheader", { name: "B" }).realClick();
  //     cy.findByRole("columnheader", { name: "B" }).should(
  //       "have.attr",
  //       "aria-sort",
  //       "none"
  //     );
  //     findCell(1, 2).should("have.text", "100.00");
  //   });

  //   it("allows sorting on server side", () => {
  //     cy.intercept("GET", "/api/investors*", (req) => {
  //       const url = new URL(req.url);
  //       const sortBy = url.searchParams.get("sort_by");

  //       const orderBy =
  //         sortBy
  //           ?.split(",")
  //           .map((s) => {
  //             const [sortColumn, sortOrder] = s.split(".");
  //             if (sortOrder && sortColumn) {
  //               return {
  //                 [sortColumn]: sortOrder,
  //               } as Record<keyof Investor, SortOrder>;
  //             }
  //           })
  //           .filter(Boolean) ?? [];

  //       const response = db.investor.findMany({
  //         // @ts-expect-error
  //         orderBy,
  //         take: 50,
  //       });

  //       return req.reply({ body: response });
  //     }).as("getInvestors");

  //     cy.mount(<ServerSideSort />);

  //     cy.wait("@getInvestors");
  //     // first click: sort in ascending order
  //     cy.findByRole("columnheader", { name: "Amount" }).realClick();
  //     cy.wait("@getInvestors");
  //     cy.findByRole("columnheader", { name: "Amount" }).should(
  //       "have.attr",
  //       "aria-sort",
  //       "ascending"
  //     );

  //     // second click: sort in descending order
  //     cy.findByRole("columnheader", { name: "Amount" }).realClick();
  //     cy.wait("@getInvestors");
  //     cy.findByRole("columnheader", { name: "Amount" }).should(
  //       "have.attr",
  //       "aria-sort",
  //       "descending"
  //     );

  //     // third click: back to default order without sorting
  //     cy.findByRole("columnheader", { name: "Amount" }).realClick();
  //     cy.wait("@getInvestors");
  //     cy.findByRole("columnheader", { name: "Amount" }).should(
  //       "have.attr",
  //       "aria-sort",
  //       "none"
  //     );
  //   });
  // });

  // describe("cell validation", () => {
  //   it("error validation should set [aria-invalid] on the grid cell", () => {
  //     cy.mount(<CellValidation />);
  //     assertGridReady();

  //     findCell(3, 0).should("have.attr", "aria-invalid", "true");
  //   });

  //   it("validation should have a default aria description of the validation state", () => {
  //     cy.mount(<CellValidation />);
  //     assertGridReady();

  //     findCell(3, 0)
  //       .should("have.attr", "aria-invalid", "true")
  //       .should("have.attr", "aria-describedby");
  //     checkAriaDescription(findCell(3, 0), "Cell validation state is error");
  //   });

  //   it("should render custom validation message as aria description", () => {
  //     cy.mount(<CellValidation />);
  //     assertGridReady();

  //     checkAriaDescription(
  //       findCell(3, 3),
  //       "This is a custom success validation message"
  //     );
  //   });

  //   it("should NOT add [aria-invalid] for non error validation states", () => {
  //     cy.mount(<CellValidation />);
  //     assertGridReady();

  //     findCell(3, 2).should("not.have.attr", "aria-invalid", "true");
  //     findCell(3, 3).should("not.have.attr", "aria-invalid", "true");
  //   });

  //   it("should render an svg icon when the validationType=strong ", () => {
  //     cy.mount(<CellValidation />);
  //     assertGridReady();

  //     checkAriaDescription(
  //       findCell(3, 3),
  //       "This is a custom success validation message"
  //     );
  //     findCell(3, 3).find("svg").should("exist");
  //   });

  //   it("should NOT render an svg icon when the validationType=light ", () => {
  //     cy.mount(<CellValidation />);
  //     assertGridReady();

  //     findCell(3, 5).should("have.attr", "aria-invalid", "true");
  //     findCell(3, 5).find("svg").should("not.exist");
  //   });
  // });

  // describe("row validation", () => {
  //   it("should render an RowValidationColumn icon when the row has an validation status", () => {
  //     cy.mount(<RowValidation />);
  //     assertGridReady();

  //     findCell(0, 1).find("svg").should("exist");
  //     findCell(1, 1).find("svg").should("not.exist");
  //     findCell(2, 1).find("svg").should("exist");
  //     findCell(3, 1).find("svg").should("not.exist");
  //     findCell(4, 1).find("svg").should("exist");
  //   });
  // });

  it("Scrolls past data grid when no rows left to scroll", () => {
    cy.mount(
      <div style={{ height: "1024px" }}>
        <LotsOfColumns style={{ height: "1024px", marginBottom: "100px" }} />
        <div
          data-testid="scroll-past"
          style={{ height: "10px", width: "10px", background: "red" }}
        />
      </div>,
    );
    assertGridReady();

    cy.findByTestId("scroll-past").should("not.be.inTheViewport");

    cy.findByTestId("grid-scrollable").realMouseWheel({ deltaY: 1500 });
    cy.wait(100);
    cy.findByTestId("scroll-past").should("be.inTheViewport");
  });

  describe("Scrolling and Pagination", () => {
    it("Does not cause an error", () => {
      cy.mount(<GridPagination />);
      assertGridReady();

      cy.findByTestId("grid-scrollable").scrollTo(0, 100, {
        easing: "linear",
        duration: 100,
      });

      const getPage = (n: number) => {
        cy.findByTestId("paginator")
          .find(`[aria-label="Page ${n} of 8"]`)
          .click();
      };

      getPage(1);
      getPage(2);
      getPage(3);
      getPage(4);
      getPage(5);
      getPage(6);
      getPage(7);
      getPage(8);
    });
  });
});
