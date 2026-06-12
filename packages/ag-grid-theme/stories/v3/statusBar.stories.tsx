import "./_setupV3";
/**
 * Phase 2 V3 spike — `StatusBar` story rendered against `saltTheme`.
 *
 * Exercises AG's `statusBar.statusPanels` panel surface, including a
 * Salt-built custom panel (`Divider` + `Text`). Visual coverage:
 *   - the status bar strip sits at the bottom of the grid and inherits the
 *     `--salt-text-fontSize` (11px) header font
 *   - `chromeBackgroundColor` from saltTheme gives the strip a
 *     `--salt-container-primary-background` fill
 *   - the auxiliary border below the grid container is kept (legacy story
 *     check for text vertical alignment).
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → StatusBar`
 * (`packages/ag-grid-theme/src/examples/StatusBar.tsx`).
 */
import { Divider, StackLayout, Text } from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const CustomClickableStatusBar = () => (
  <StackLayout direction="row" align="center" gap={1}>
    <Divider
      orientation="vertical"
      variant="secondary"
      style={{ height: "var(--salt-text-fontSize)", alignSelf: "center" }}
    />
    {/* In status bar, line height being size base keeps text in the middle */}
    <Text color="secondary" style={{ lineHeight: "var(--salt-size-base)" }}>
      Custom Component
    </Text>
  </StackLayout>
);

const statusBar = {
  statusPanels: [
    { statusPanel: "agTotalRowCountComponent", align: "left" },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
    { statusPanel: CustomClickableStatusBar },
  ],
};

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const StatusBar = () => (
  <StackLayout gap={2}>
    <Text>Select rows to enable status bar display</Text>
    <div
      style={{
        height: 500,
        width: 800,
        // Not part of the theme, add a border to check text center alignment
        borderBottom: "1px solid var(--salt-container-primary-borderColor)",
      }}
    >
      <AgGridReact
        theme={saltTheme}
        {...saltAgGridDefaults}
        cellSelection
        rowSelection="multiple"
        statusBar={statusBar}
        columnDefs={dataGridExampleColumns}
        rowData={dataGridExampleData}
        onFirstDataRendered={(params) => {
          params.api.forEachNode((node, index) => {
            if (node.data && index < 3) {
              node.setSelected(true);
            }
          });
        }}
      />
    </div>
  </StackLayout>
);

