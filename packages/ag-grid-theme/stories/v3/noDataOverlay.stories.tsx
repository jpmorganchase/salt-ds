import "./_setupV3";
/**
 * Phase 2 V3 spike — `NoDataOverlay` story rendered against `saltTheme`.
 *
 * Exercises a custom `noRowsOverlayComponent` (Salt `DialogHeader` +
 * `DialogContent` + `DialogActions`) drawn when `rowData=[]`. Visual check:
 *   - the dialog renders inline (not centered to viewport) so it overlays
 *     the empty grid area
 *   - the `status="error"` DialogHeader picks up Salt error tokens
 *   - the underlying grid still shows the Salt-styled header row.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → NoDataOverlay`
 * (`packages/ag-grid-theme/src/examples/NoDataOverlay.tsx`).
 */
import {
  Button,
  DialogActions,
  DialogContent,
  DialogHeader,
} from "@salt-ds/core";
import { saltAgGridDefaults, saltTheme } from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Assembling a custom Dialog so it's not floating to the center of the full screen.
const CustomDialog = () => (
  <div
    style={{
      paddingBlock: "var(--salt-spacing-300)",
      border:
        "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-status-error-borderColor)",
    }}
  >
    <DialogHeader status="error" header="Can`t move file" />
    <DialogContent>
      You don&#39;t have permission to move or delete this file.
    </DialogContent>
    <DialogActions>
      <Button>Help Desk</Button>
      <Button appearance="solid" sentiment="accented">
        Reload
      </Button>
    </DialogActions>
  </div>
);

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const NoDataOverlay = () => (
  <div style={{ height: 800, width: 800 }}>
    <AgGridReact
      theme={saltTheme}
      {...saltAgGridDefaults}
      columnDefs={dataGridExampleColumns}
      rowData={[]}
      noRowsOverlayComponent={CustomDialog}
    />
  </div>
);

