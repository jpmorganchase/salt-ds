import "./_setupV3";
/**
 * Phase 1 V3 spike — `CheckboxSelection` story rendered against `saltTheme`.
 *
 * Exercises the `saltCheckboxStyle` part (Phase 1 wiring lands in the same
 * commit as this story). The legacy story sizes checkboxes via
 * `--salt-size-selectable` (16px / 12px in compact) and colours them via
 * `--ag-checkbox-{checked,indeterminate,unchecked}-color` mapped to
 * `--salt-selectable-*` tokens. In v3 the colours become typed params on
 * the `checkboxStyle` part; the size remains a CSS rule shipped in the
 * part's `css` payload (no equivalent typed param exists in v33's
 * `CheckboxStyleParams`).
 *
 * Pairs with the legacy story `Ag Grid/Ag Grid Theme → CheckboxSelection`
 * (`packages/ag-grid-theme/src/examples/CheckboxSelection.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

// AG Grid v33+ requires explicit module registration. Idempotent.
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const CheckboxSelection = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={dataGridExampleColumns}
      rowData={dataGridExampleData}
      rowSelection="multiple"
      onFirstDataRendered={(params) => {
        // Match the legacy story: rows 3..6 pre-selected so the rendered
        // state shows checked + unchecked + (potentially indeterminate header) boxes.
        params.api.forEachNode((node, index) => {
          if (node.data && index < 7 && index > 2) {
            node.setSelected(true);
          }
        });
      }}
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
