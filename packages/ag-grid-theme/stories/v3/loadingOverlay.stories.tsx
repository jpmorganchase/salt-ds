import "./_setupV3";
/**
 * Phase 2 V3 spike — `LoadingOverlay` story rendered against `saltTheme`.
 *
 * Exercises a custom `loadingOverlayComponent` (Salt `Card` + `Spinner` +
 * `Text`) drawn over the grid while `rowData` is undefined. Visual check:
 *   - the overlay is centered inside the grid by AG's own positioning
 *   - the modal overlay backdrop colour is `modalOverlayBackgroundColor`
 *     from saltTheme (set to `var(--salt-overlayable-background)`).
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → LoadingOverlay`
 * (`packages/ag-grid-theme/src/examples/LoadingOverlay.tsx`).
 */
import { Card, Spinner, StackLayout, Text } from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const CustomOverlay = () => (
  <Card>
    <StackLayout gap={2} align="center">
      <Spinner />
      <Text aria-atomic="true" aria-live="polite">
        Loading...
      </Text>
    </StackLayout>
  </Card>
);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const LoadingOverlay = () => (
  <StackLayout gap={4}>
    <div style={{ position: "relative" }}>
      <div style={{ height: 500, width: 800 }} tabIndex={-1}>
        <AgGridReact
          theme={saltTheme}
          {...saltAgGridDefaults}
          columnDefs={dataGridExampleColumns}
          loadingOverlayComponent={CustomOverlay}
          rowData={undefined}
        />
      </div>
    </div>
  </StackLayout>
);

