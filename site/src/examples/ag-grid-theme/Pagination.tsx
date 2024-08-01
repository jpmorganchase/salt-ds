import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns, defaultData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

const generateData = (states: typeof defaultData) =>
  states.reduce(
    (result, row) => {
      const data = [];
      data.push(row);
      for (let i = 0; i < 20; i++) {
        data.push({ ...row, name: `${row.name} ${i}` });
      }
      return result.concat(data);
    },
    [] as typeof defaultData,
  );

export const Pagination = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
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
