import { useDensity, useTheme } from "@salt-ds/core";
import type { GridReadyEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { type ReactElement, useMemo } from "react";
import { defaultData } from "./data";

const columnDefs = [
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
];

export const Default = (): ReactElement => {
  const { mode } = useTheme();
  const density = useDensity();

  const onGridReady = ({ api }: GridReadyEvent) => {
    api.sizeColumnsToFit();
  };

  const rowHeight = useMemo(() => {
    switch (density) {
      case "high":
        return 25;
      case "medium":
        return 37;
      case "low":
        return 49;
      case "touch":
        return 61;
      default:
        return 25;
    }
  }, [density]);

  return (
    <div
      className={`ag-theme-salt-${mode}`}
      style={{ height: 500, width: "100%" }}
    >
      <AgGridReact
        columnDefs={columnDefs}
        rowData={defaultData}
        rowSelection="single"
        cellSelection={true}
        onGridReady={onGridReady}
        rowHeight={rowHeight}
      />
    </div>
  );
};
