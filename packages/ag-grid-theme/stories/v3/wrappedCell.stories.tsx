import "./_setupV3";
/**
 * Phase 2 V3 spike — `WrappedCell` story rendered against `saltTheme`.
 *
 * Exercises `wrapText: true` + `autoHeight: true` on the `Name` column so
 * rows expand vertically to fit the wrapped content. Visual coverage:
 *   - `rowHeight` from saltTheme is treated as a *minimum* — AG measures
 *     wrapped text and grows the row past the calc-based default.
 *   - `rowBorder` still draws a 1px separator between the variable-height
 *     rows.
 *
 * Differences from the legacy story:
 *   - The legacy story shipped a `<Checkbox>` toggle that flipped on the
 *     `useAgGridHelpers({ compact: true })` branch (21px / 20px row/header
 *     heights at high density). v3 drops the compact tier (proposal §9
 *     decision 2) — density flows from `SaltProvider` (use Storybook's
 *     density toolbar to verify the contracted rhythm). The toggle is
 *     removed.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → WrappedCell`
 * (`packages/ag-grid-theme/src/examples/WrappedCell.tsx`).
 */
import { StackLayout } from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import {
  AllCommunityModule,
  type ColDef,
  ModuleRegistry,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const longNamesData = dataGridExampleData.map((d) => ({
  ...d,
  name: Array(10).fill(d.name).join(" "),
}));

const columnDefs: ColDef[] = [
  {
    headerName: "Repeated Name",
    field: "name",
    wrapText: true,
    autoHeight: true,
  },
  { headerName: "Code", field: "code" },
  { headerName: "Capital", field: "capital" },
];

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const WrappedCell = () => (
  <StackLayout gap={4}>
    <div style={{ height: 500, width: 800 }}>
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        columnDefs={columnDefs}
        rowData={longNamesData}
      />
    </div>
  </StackLayout>
);
