import "./_setupV3";
/**
 * Phase 0 V3 spike — `Default` story rendered against the new `saltTheme`.
 *
 * Sits alongside the existing legacy `Default` story in
 * `ag-grid-theme.stories.tsx` so Chromatic / manual review can do a
 * side-by-side visual diff between:
 *
 *   - **2.x legacy mode** — `salt-ag-theme.css` + `.ag-theme-salt-*` class +
 *     `provideGlobalGridOptions({ theme: "legacy" })`. Lives in
 *     `ag-grid-theme.stories.tsx`.
 *
 *   - **v3 (this file)** — `<AgGridReact theme={saltTheme} />`. No legacy
 *     CSS, no theme class. Module registration still happens via the
 *     shared setup module, but the `theme: "legacy"` global is overridden
 *     by passing `theme={saltTheme}` explicitly.
 *
 * Phase 0 acceptance: typecheck green with zero `as any` in the §4.3
 * params block. Visual parity is best-effort at this stage — the Salt-
 * specific parts (`saltCellStates`, `saltFocusRing`, `saltRangeSelectionAdjustments`,
 * `saltCheckboxStyle`) are skeletons with no CSS yet, so secondary
 * states (focus, error, selection outline) will not match 2.x until
 * Phase 1+ ports the CSS bodies.
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

// AG Grid v33+ requires explicit module registration. The legacy story uses
// the shared setupAgGridLegacy module; v3 doesn't need the legacy theme opt-in
// but DOES need the modules.
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const Default = () => (
  <div style={{ height: 400, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={[
        { headerName: "Name", field: "name" },
        { headerName: "Code", field: "code" },
        { headerName: "Capital", field: "capital" },
      ]}
      rowData={dataGridExampleData}
      rowSelection="single"
    />
  </div>
);

