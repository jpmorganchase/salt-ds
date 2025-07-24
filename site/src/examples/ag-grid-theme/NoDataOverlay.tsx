import {
  Button,
  DialogActions,
  DialogContent,
  DialogHeader,
} from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

// Assembling a custom Dialog so it's not floating to the center of the full screen.
const CustomDialog = () => {
  return (
    <div
      style={{
        paddingBlock: "var(--salt-spacing-300)",
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-status-error-borderColor)",
      }}
    >
      <DialogHeader status="error" header="Can`t move file" />
      <DialogContent>
        You don&apos;t have permission to move or delete this file.
      </DialogContent>
      <DialogActions>
        <Button>Help Desk</Button>
        <Button sentiment="accented">Reload</Button>
      </DialogActions>
    </div>
  );
};

export const NoDataOverlay = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div style={{ height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={defaultColumns}
        rowData={[]}
        noRowsOverlayComponent={CustomDialog}
      />
    </div>
  );
};
