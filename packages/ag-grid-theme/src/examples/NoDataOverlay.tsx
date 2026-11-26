import {
  Button,
  DialogActions,
  DialogContent,
  DialogHeader,
} from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";

// Assembling a custom Dialog so it's not floating to the center of the full screen.
const CustomDialog = () => {
  return (
    <div
      style={{
        paddingBlock: "var(--salt-spacing-300)",
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-status-error-borderColor)",
        // Matching Salt's Dialog
        borderRadius: "var(--salt-palette-corner, 0)",
        background: "var(--salt-container-primary-background)",
        boxShadow: "var(--salt-overlayable-shadow-modal)",
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
};

const NoDataOverlay = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        columnDefs={dataGridExampleColumns}
        rowData={[]}
        noRowsOverlayComponent={CustomDialog}
      />
    </div>
  );
};

export default NoDataOverlay;
