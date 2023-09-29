import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

const generateData = (states: typeof defaultData) =>
  states.reduce((result, row) => {
    const data = [];
    data.push(row);
    for (let i = 0; i < 20; i++) {
      data.push({ ...row, name: `${row.name} ${i}` });
    }
    return [...result, ...data];
  }, [] as typeof defaultData);

const PagedGrid = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        columnDefs={defaultColumns}
        pagination
        paginationPageSize={100}
        rowData={generateData(defaultData)}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

const Pagination = () => (
  <div
    style={{
      marginTop: "-150px",
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <PagedGrid />
  </div>
);

export default Pagination;
