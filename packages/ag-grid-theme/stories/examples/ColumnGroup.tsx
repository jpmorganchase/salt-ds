import { ColDef, ColGroupDef } from "ag-grid-community";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ColumnGroup = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
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
    suppressMenu: true,
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

ColumnGroup.parameters = {
  chromatic: { disableSnapshot: false },
};

export default ColumnGroup;
