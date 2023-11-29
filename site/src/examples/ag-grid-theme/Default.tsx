import { AgGridReact } from "ag-grid-react";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import { defaultData } from "./data";
import { useDensity, useTheme } from "@salt-ds/core";

import "ag-grid-community/styles/ag-grid.css";
import "@salt-ds/ag-grid-theme/salt.css";

export const Default = (): ReactElement => {
  const [isGridReady, setGridReady] = useState(false);
  const { mode } = useTheme();
  const density = useDensity();

  const apiRef = useRef<{ api: GridApi; columnApi: ColumnApi }>();
  const onGridReady = ({ api, columnApi }: GridReadyEvent) => {
    apiRef.current = { api, columnApi };
    api.sizeColumnsToFit();
    setGridReady(true);
  };

  const rowHeight = useMemo(() => {
    switch (density) {
      case "high":
        return 24;
      case "medium":
        return 36;
      case "low":
        return 48;
      case "touch":
        return 60;
      default:
        return 20;
    }
  }, [density]);

  useEffect(() => {
    // setHeaderHeight doesn't work if not in setTimeout
    setTimeout(() => {
      if (isGridReady) {
        apiRef.current?.api.resetRowHeights();
        apiRef.current!.api.setHeaderHeight(rowHeight);
        apiRef.current!.api.setFloatingFiltersHeight(rowHeight);
      }
    }, 0);
  }, [density, isGridReady, rowHeight]);

  return (
    <div
      className={`ag-theme-salt-${mode}`}
      style={{ height: 500, width: "100%" }}
    >
      <AgGridReact
        columnDefs={[
          {
            headerName: "Name",
            field: "name",
            filterParams: {
              buttons: ["reset", "apply"],
            },
            editable: false,
            autoHeight: true,
          },
          {
            headerName: "Code",
            field: "code",
          },
          {
            headerName: "Capital",
            field: "capital",
          },
        ]}
        rowData={defaultData}
        rowSelection="single"
        enableRangeSelection={true}
        onGridReady={onGridReady}
        rowHeight={rowHeight}
      />
    </div>
  );
};
