import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import type { ReactElement } from "react";
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
  // The theme follows the mode and density of the nearest SaltProvider, including row heights.
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        theme="legacy"
        columnDefs={columnDefs}
        rowData={defaultData}
        rowSelection="single"
        autoSizeStrategy={{ type: "fitGridWidth" }}
      />
    </div>
  );
};
