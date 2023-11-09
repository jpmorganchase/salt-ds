import { composeStories } from "@storybook/react";
import * as agGridStories from "@stories/ag-grid-theme.stories";

const {
  BasicGrid,
  CheckboxSelection,
  Coloration,
  ColumnGroup,
  ColumnSpanning,
  ContextMenu,
  CustomFilter,
  DragRowOrder,
  Icons,
  FloatingFilter,
  HDCompact,
  HDCompactDark,
  InfiniteScroll,
  LoadingOverlay,
  MasterDetail,
  MasterDetailDark,
  NoDataOverlay,
  Pagination,
  ParentChildRows,
  RowGrouping,
  RowGroupPanel,
  PinnedRows,
  StatusBar,
  StatusBarDark,
  WrappedHeader,
} = composeStories(agGridStories);

describe("Given Ag Grid Theme - uitk", () => {
  describe("WHEN the Default story is mounted", () => {
    describe("WHEN column menu is open", () => {
      describe("AND general tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<BasicGrid defaultTheme="uitk" />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND filter tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<BasicGrid defaultTheme="uitk" />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="filter"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND columns tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<BasicGrid defaultTheme="uitk" />);
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
        cy.mount(<CheckboxSelection defaultTheme="uitk" />);
        cy.wait(500);
        cy.get(".editable-cell").realClick();
        cy.focused().parents(".ag-row").matchImage({ maxDiffThreshold: 0.1 });
      });
    });
    describe("WHEN editable-cell is in edit mode", () => {
      it("THEN should match screenshot", () => {
        cy.mount(<CheckboxSelection defaultTheme="uitk" />);
        cy.wait(500);
        cy.get(".editable-cell").realClick({ clickCount: 2 });
        cy.focused().parents(".ag-row").matchImage({ maxDiffThreshold: 0.1 });
      });
    });
    describe("WHEN number-cell column menu is open", () => {
      describe("AND filter tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<CheckboxSelection defaultTheme="uitk" />);
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

  describe.skip("WHEN the Coloration story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<Coloration defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the ColumnGroup story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<ColumnGroup defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the ColumnSpanning story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<ColumnSpanning defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe("WHEN the ContextMenu story is mounted", () => {
    describe("WHEN cell context menu is open", () => {
      it("THEN should match screenshot", () => {
        cy.mount(<ContextMenu defaultTheme="uitk" />);
        cy.wait(500);
        cy.findByText("Alabama").rightclick();
        cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
      });
    });
  });
  describe("WHEN the CustomFilter story is mounted", () => {
    describe("WHEN custom filter is focused", () => {
      it("THEN should match screenshot", () => {
        cy.mount(<CustomFilter defaultTheme="uitk" />);
        cy.wait(500);
        cy.get(".ag-floating-filter-input").realClick();
        cy.focused()
          .parents(".ag-floating-filter")
          .matchImage({ maxDiffThreshold: 0.1 });
      });
    });
  });
  describe.skip("WHEN the DragRowOrder story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<DragRowOrder defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe("WHEN the Icons story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<Icons defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the FloatingFilter story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<FloatingFilter defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe("WHEN the HDCompact story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<HDCompact defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
    describe("WHEN column menu is open", () => {
      describe("AND general tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompact defaultTheme="uitk" />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND filter tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompact defaultTheme="uitk" />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="filter"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND columns tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompact defaultTheme="uitk" />);
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
    it.skip("THEN should match screenshot", () => {
      cy.mount(<HDCompactDark defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
    describe("WHEN column menu is open", () => {
      describe("AND general tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompactDark defaultTheme="uitk" />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND filter tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompactDark defaultTheme="uitk" />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="filter"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
      describe("AND columns tab is selected", () => {
        it("THEN should match screenshot", () => {
          cy.mount(<HDCompactDark defaultTheme="uitk" />);
          cy.wait(500);
          cy.get(".ag-header-cell-menu-button").realClick();
          cy.get('[aria-label="columns"]').realClick();
          cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
        });
      });
    });
  });
  describe.skip("WHEN the InfiniteScroll story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<InfiniteScroll defaultTheme="uitk" />);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the LoadingOverlay story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<LoadingOverlay defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the MasterDetail story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<MasterDetail defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the MasterDetailDark story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<MasterDetailDark defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the NoDataOverlay story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<NoDataOverlay defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the Pagination story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<Pagination defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the ParentChildRows story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<ParentChildRows defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the RowGrouping story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<RowGrouping defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the RowGroupPanel story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<RowGroupPanel defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the PinnedRows story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<PinnedRows defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the StatusBar story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<StatusBar defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the StatusBarDark story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<StatusBarDark defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the WrappedHeader story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<WrappedHeader defaultTheme="uitk" />);
      cy.wait(500);
      cy.matchImage();
    });
  });
});
