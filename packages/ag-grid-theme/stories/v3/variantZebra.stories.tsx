import "./_setupV3";
/**
 * Phase 1 V3 spike — `VariantZebra` story rendered against `saltTheme`.
 *
 * Exercises `saltZebra`. Pairs with the legacy story
 * `Ag Grid → Ag Grid Theme → VariantZebra`
 * (`packages/ag-grid-theme/src/examples/VariantZebra.tsx`) which adds
 * `.ag-theme-salt-variant-zebra` to the wrapper. The v3 equivalent is
 * composing the saltZebra part onto saltTheme via withPart().
 */
import {
  saltAgGridDefaults,
  saltTheme,
  saltZebra,
} from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const themedZebra = saltTheme.withPart(saltZebra);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const VariantZebra = () => (
  <div style={V3_STORY_CONTAINER}>
    <AgGridReact
      theme={themedZebra}
      {...saltAgGridDefaults}
      columnDefs={dataGridExampleColumns}
      rowData={dataGridExampleData}
      rowSelection="multiple"
      onGridReady={fitColumnsOnReady}
    />
  </div>
);
