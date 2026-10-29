import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import absoluteSortingExampleData from "../dependencies/absoluteSortingExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const colDef = [
  {
    headerName: "Name",
    field: "name",
  },
  {
    headerName: "Ranking change",
    field: "rankingChange",
    type: "numericColumn",
    cellClass: ["numeric-cell"],
    // [VERSION DIVERGENCE]: Absolute sorting (`sort.type: "absolute"`) and aasc/adesc icons require AG Grid v35+.
    sort: { direction: "asc", type: "absolute" } as unknown as "asc",
  },
];

const AbsoluteSorting = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={colDef}
        rowData={absoluteSortingExampleData}
      />
    </div>
  );
};

export default AbsoluteSorting;
