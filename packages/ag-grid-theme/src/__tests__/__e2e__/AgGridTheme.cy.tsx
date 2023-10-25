import { composeStories } from "@storybook/react";
import * as agGridStories from "@stories/ag-grid-theme.stories";

const {
  BasicGrid,
  CheckboxSelection,
  ContextMenu,
  CustomFilter,
  HDCompact,
  HDCompactDark,
} = composeStories(agGridStories);

describe("Given Ag Grid Theme", () => {
  describe("WHEN the Default story is mounted", () => {
    describe("WHEN column menu is open", () => {
      describe("AND general tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<BasicGrid />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND filter tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<BasicGrid />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="filter"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND columns tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<BasicGrid />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="columns"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
    });
  });
  describe("WHEN the CheckboxSelection story is mounted", () => {
    describe("WHEN editable-cell is focused", () => {
      it("THEN should match screenshot", () => {
        cy.mount(<CheckboxSelection />);
        cy.wait(500);
        cy.get(".editable-cell").realClick();
        cy.focused().parents(".ag-row").matchImage({ maxDiffThreshold: 0.1 });
      });
    });
    describe("WHEN editable-cell is in edit mode", () => {
      it("THEN should match screenshot", () => {
        cy.mount(<CheckboxSelection />);
        cy.wait(500);
        cy.get(".editable-cell").realClick({ clickCount: 2 });
        cy.focused().parents(".ag-row").matchImage({ maxDiffThreshold: 0.1 });
      });
    });
    describe("WHEN number-cell column menu is open", () => {
      describe("AND filter tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<CheckboxSelection />);
          cy.wait(500);
          cy.contains("Population")
            .parent()
            .prev(".ag-header-cell-menu-button")
            .realClick();
          cy.get('[aria-label="filter"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
    });
  });

  describe("WHEN the ContextMenu story is mounted", () => {
    describe("WHEN cell context menu is open", () => {
      it("THEN should match screenshot", () => {
        cy.mount(<ContextMenu />);
        cy.wait(500);
        cy.findByText("Alabama").rightclick();
        cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
      });
    });
  });
  describe("WHEN the CustomFilter story is mounted", () => {
    describe("WHEN custom filter is focused", () => {
      it("THEN should match screenshot", () => {
        cy.mount(<CustomFilter />);
        cy.wait(500);
        cy.get(".ag-floating-filter-input").realClick();
        cy.focused()
          .parents(".ag-floating-filter")
          .matchImage({ maxDiffThreshold: 0.1 });
      });
    });
  });
  describe("WHEN the HDCompact story is mounted", () => {
    describe("WHEN column menu is open", () => {
      describe("AND general tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompact />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND filter tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompact />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="filter"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND columns tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompact />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="columns"]').realClick();
          cy.wait(500);
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
    });
  });
  describe("WHEN the HDCompactDark story is mounted", () => {
    describe("WHEN column menu is open", () => {
      describe("AND general tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompactDark />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND filter tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompactDark />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="filter"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND columns tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompactDark />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="columns"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
    });
  });
});
