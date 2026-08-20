import { useDensity, useTheme } from "@salt-ds/core";
import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { type ReactElement, useMemo } from "react";
import { defaultData } from "./data";

const columnDefs: ColDef[] = [
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
        theme="legacy"
        columnDefs={columnDefs}
        rowData={defaultData}
        rowSelection="single"
        cellSelection={true}
        // [VERSION DIVERGENCE]: In v36, sizing on gridReady can run before vertical-scroll visibility is known. Let AG Grid defer fitting until data is rendered.
        autoSizeStrategy={{ type: "fitGridWidth" }}
        rowHeight={rowHeight}
      />
    </div>
  );
};
