import "./_setupV3";
/**
 * Phase 2 V3 spike — `Pagination` story rendered against `saltTheme`.
 *
 * Exercises AG's built-in `pagination` controls (the pager strip at the
 * bottom of the grid):
 *   - the pager strip text + dropdown inherit `foregroundColor` /
 *     `fontFamily` from saltTheme
 *   - the page-navigation glyphs (`«`, `‹`, `›`, `»`) come from the
 *     `saltIconSet` Material codepoints
 *   - row data is inflated to ~1000 entries so the pager is meaningful at
 *     `paginationPageSize={100}`.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → Pagination`
 * (`packages/ag-grid-theme/src/examples/Pagination.tsx`).
 */
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const generateData = (states: typeof dataGridExampleData) =>
  states.reduce(
    (result, row) => {
      const data = [row];
      for (let i = 0; i < 20; i++) {
        data.push({ ...row, name: `${row.name} ${i}` });
      }
      return result.concat(data);
    },
    [] as typeof dataGridExampleData,
  );

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const Pagination = () => (
  <div style={{ height: 500, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={dataGridExampleColumns}
      pagination
      paginationPageSize={100}
      rowData={generateData(dataGridExampleData)}
    />
  </div>
);

