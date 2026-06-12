import "./_setupV3";
/**
 * Phase 1 V3 spike — `VariantSecondary` story rendered against `saltTheme`.
 *
 * Exercises `saltRowVariantSecondary`. Pairs with the legacy story
 * `Ag Grid → Ag Grid Theme → VariantSecondary`
 * (`packages/ag-grid-theme/src/examples/VariantSecondary.tsx`) which adds
 * `.ag-theme-salt-variant-secondary` to the wrapper. The v3 equivalent is
 * composing the saltRowVariantSecondary part onto saltTheme via withPart().
 */
import {
  saltAgGridDefaults,
  saltRowVariantSecondary,
  saltTheme,
} from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const themedSecondary = saltTheme.withPart(saltRowVariantSecondary);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const VariantSecondary = () => (
  <div style={{ height: 400, width: 800 }}>
    <AgGridReact
      theme={themedSecondary}
      {...saltAgGridDefaults}
      columnDefs={dataGridExampleColumns}
      rowData={dataGridExampleData}
      rowSelection="multiple"
    />
  </div>
);

