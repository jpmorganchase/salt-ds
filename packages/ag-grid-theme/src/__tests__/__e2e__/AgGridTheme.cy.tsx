import { composeStories } from "@storybook/react";
import * as agGridStories from "@stories/ag-grid-theme.stories";

const logSizes = () => {
  // let's get the total opened browser dimensions
  const windowWidth = window.top.innerWidth
  const windowHeight = window.top.innerHeight

  cy.log(`browser window is: **${windowWidth} x ${windowHeight}**`)

  // part of the browser window is taken up the command log
  const commandLog = window.top.document.querySelector('.viewport')
  const commandLogWidth = commandLog.offsetWidth
  const commandLogHeight = commandLog.offsetHeight

  cy.log(`command log is: **${commandLogWidth} x ${commandLogHeight}**`)

  // the app thinks it has the following dimensions
  cy.window({ log: false }).then((win) => {
    // the application is scaled to fit into its iframe
    // and the iframe's dimensions are
    const iframe = cy.state('$autIframe')
    const iframeWidth = Math.round(iframe.width())
    const iframeHeight = Math.round(iframe.height())

    cy.log(`app iframe real size is: **${iframeWidth} x ${iframeHeight}**`)

    // the application thinks it has the window of the follow size
    // which is the "viewport" numbers
    const viewportWidth = win.innerWidth
    const viewportHeight = win.innerHeight

    cy.log(`app viewport is: **${viewportWidth} x ${viewportHeight}**`)
  })
}


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
  VariantSecondary,
  VariantSecondaryDark,
  VariantZebra,
  VariantZebraDark,
  WrappedHeader,
} = composeStories(agGridStories);

describe("Given Ag Grid Theme", () => {
  describe("WHEN the Default story is mounted", () => {
    it.skip("THEN should match screenshot", () => {
      cy.mount(<BasicGrid />);
      cy.wait(500);
      logSizes();
      cy.matchImage();
    });
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
    it.skip("THEN should match screenshot", () => {
      cy.mount(<CheckboxSelection />);
      cy.wait(500);
      cy.matchImage();
    });
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

  describe.skip("WHEN the Coloration story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<Coloration />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the ColumnGroup story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<ColumnGroup />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the ColumnSpanning story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<ColumnSpanning />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe("WHEN the ContextMenu story is mounted", () => {
    it.skip("THEN should match screenshot", () => {
      cy.mount(<ContextMenu />);
      cy.wait(500);
      cy.matchImage();
    });
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
    it.skip("THEN should match screenshot", () => {
      cy.mount(<CustomFilter />);
      cy.wait(500);
      cy.matchImage();
    });
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
  describe.skip("WHEN the DragRowOrder story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<DragRowOrder />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the Icons story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<Icons />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the FloatingFilter story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<FloatingFilter />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe("WHEN the HDCompact story is mounted", () => {
    it.skip("THEN should match screenshot", () => {
      cy.mount(<HDCompact />);
      cy.wait(500);
      cy.matchImage();
    });
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
    it.skip("THEN should match screenshot", () => {
      cy.mount(<HDCompactDark />);
      cy.wait(500);
      cy.matchImage();
    });
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
  describe.skip("WHEN the InfiniteScroll story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<InfiniteScroll />);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the LoadingOverlay story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<LoadingOverlay />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the MasterDetail story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<MasterDetail />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the MasterDetailDark story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<MasterDetailDark />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the NoDataOverlay story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<NoDataOverlay />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the Pagination story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<Pagination />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the ParentChildRows story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<ParentChildRows />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the RowGrouping story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<RowGrouping />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the RowGroupPanel story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<RowGroupPanel />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the PinnedRows story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<PinnedRows />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the StatusBar story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<StatusBar />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the StatusBarDark story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<StatusBarDark />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the VariantSecondary story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<VariantSecondary />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the VariantSecondaryDark story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<VariantSecondaryDark />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the VariantZebra story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<VariantZebra />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the VariantZebraDark story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<VariantZebraDark />);
      cy.wait(500);
      cy.matchImage();
    });
  });
  describe.skip("WHEN the WrappedHeader story is mounted", () => {
    it("THEN should match screenshot", () => {
      cy.mount(<WrappedHeader />);
      cy.wait(500);
      cy.matchImage();
    });
  });
});
