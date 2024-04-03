import { globalTypes } from ".storybook/preview";
import { ModeValues } from "@salt-ds/core";
import * as agGridStories from "@stories/ag-grid-theme.stories";
import { composeStories } from "@storybook/react";
import { withTheme } from "docs/decorators/withTheme";

ModeValues.forEach((mode) => {
  const { BasicGrid, CheckboxSelection, ContextMenu, CustomFilter, HDCompact } =
    composeStories(agGridStories, {
      decorators: [withTheme],
      globalTypes: { mode: { ...globalTypes.mode, defaultValue: mode } },
    }); // `globals` doesn't work, so override defaultValue as workaround

  describe(`Given Ag Grid Theme in ${mode} mode`, () => {
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
      describe("AND cell is hovered", () => {
        it("THEN should show tooltip", () => {
          cy.mount(<BasicGrid />);
          cy.wait(500);
          cy.findByText("Capital").realHover();
          cy.findAllByText("Capital").should("have.length", 2);
          cy.get(".ag-tooltip").should(
            "have.css",
            "background-color",
            mode === "light" ? "rgb(255, 255, 255)" : "rgb(36, 37, 38)"
          );
        });
      });
      describe("WHEN range selection", () => {
        it("AND selection vertical THEN should match screenshot", () => {
          cy.mount(<BasicGrid />);
          cy.wait(500);

          cy.get(".ag-cell")
            .eq(0)
            .realMouseDown({ scrollBehavior: false })
            .should("have.class", "ag-cell-range-selected")
            .realMouseMove(0, 100, { scrollBehavior: false });

          cy.get(".ag-cell")
            .eq(6)
            .realMouseUp({ scrollBehavior: false })
            .realMouseWheel({ deltaY: -100 });

          cy.get(".ag-cell-range-selected").should("have.length", 3);

          cy.wait(500);

          cy.get(".ag-root-wrapper").matchImage({ maxDiffThreshold: 0.1 });
        });

        it("AND selection horizontal THEN should match screenshot", () => {
          cy.mount(<BasicGrid />);
          cy.wait(500);

          cy.get(".ag-cell")
            .eq(0)
            .realMouseDown({ scrollBehavior: false })
            .should("have.class", "ag-cell-range-selected")
            .realMouseMove(600, 0, { scrollBehavior: false });

          cy.get(".ag-cell").eq(3).realMouseUp({ scrollBehavior: false });

          cy.get(".ag-cell-range-selected").should("have.length", 3);

          cy.wait(500);

          cy.get(".ag-root-wrapper").matchImage({ maxDiffThreshold: 0.1 });
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
            cy.get(".ag-menu").matchImage({ maxDiffThreshold: 0.1 });
          });
        });
      });
    });
  });
});
