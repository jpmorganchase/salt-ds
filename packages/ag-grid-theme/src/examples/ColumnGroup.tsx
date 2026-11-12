import type { ColDef, ColGroupDef } from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";

const ColumnGroup = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        rowSelection="multiple"
        rowData={dataGridExampleData}
        columnDefs={columnsWithGrouping("US States")}
      />
    </div>
  );
};

const columnsWithGrouping = (groupName: string): (ColGroupDef | ColDef)[] => [
  {
    headerName: "",
    field: "on",
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 38,
    pinned: "left",
    suppressHeaderMenuButton: true,
    suppressHeaderFilterButton: true,
  },
  {
    headerName: groupName,
    children: [
      {
        headerName: "Name",
        field: "name",
        filterParams: {
          buttons: ["reset", "apply"],
        },
        editable: false,
      },
      {
        headerName: "Code",
        field: "code",
        columnGroupShow: "open",
      },
      {
        headerName: "Capital",
        field: "capital",
      },
      {
        headerName: "Population",
        type: "numericColumn",
        field: "population",
        filter: "agNumberColumnFilter",
        editable: true,
        cellClass: ["numeric-cell", "editable-cell"],
      },
    ],
  },
];

export default ColumnGroup;
