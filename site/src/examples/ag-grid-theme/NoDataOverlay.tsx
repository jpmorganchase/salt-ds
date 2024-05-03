import {
  Button,
  DialogActions,
  DialogContent,
  DialogHeader,
} from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { defaultColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

// Assembling a custom Dialog so it's not floating to the center of the full screen.
const CustomDialog = () => {
  return (
    <div
      style={{
        paddingBlock: "var(--salt-spacing-300)",
        border: `var(--salt-size-border) var(--salt-container-borderStyle) var(--salt-status-error-borderColor)`,
      }}
    >
      <DialogHeader status="error" header="Can`t move file" />
      <DialogContent>
        You don't have permission to move or delete this file.
      </DialogContent>
      <DialogActions>
        <Button>Help Desk</Button>
        <Button variant="cta">Reload</Button>
      </DialogActions>
    </div>
  );
};

export const NoDataOverlay = (props: AgGridReactProps) => {
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
