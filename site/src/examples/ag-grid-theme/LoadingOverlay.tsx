import { CSSProperties } from "react";
import { AgGridReact } from "ag-grid-react";
import { Card, Spinner } from "@salt-ds/core";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

export const LoadingOverlay = () => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  const getModalStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    width: "100%",
    left: "50%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: "3",
    textAlign: "center",
    transform: "translate(-50%, -50%)",
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div className="modal" style={getModalStyle}>
        <Card style={{ minHeight: "auto" }}>
          <div>
            <Spinner style={{ margin: "0 auto" }} />
            <div
              aria-atomic="true"
              aria-live="polite"
              style={{ fontSize: "16px", marginTop: "18px" }}
              tabIndex={0}
            >
              Loading...
            </div>
          </div>
        </Card>
      </div>
      <div {...containerProps} tabIndex={-1}>
        <AgGridReact
          {...agGridProps}
          columnDefs={defaultColumns}
          rowData={defaultData}
        />
      </div>
    </div>
  );
};
