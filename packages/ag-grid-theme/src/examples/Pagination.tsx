import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const generateData = (states: typeof dataGridExampleData) =>
  states.reduce((result, row) => {
    const data = [];
    data.push(row);
    for (let i = 0; i < 20; i++) {
      data.push({ ...row, name: `${row.name} ${i}` });
    }
    return [...result, ...data];
  }, [] as typeof dataGridExampleData);

const Pagination = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={dataGridExampleColumns}
        pagination
        paginationPageSize={100}
        rowData={generateData(dataGridExampleData)}
      />
    </div>
  );
};

export default Pagination;
