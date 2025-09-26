import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { validationCellExampleColumns, validationExampleData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const CellValidation = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        rowData={validationExampleData}
        columnDefs={validationCellExampleColumns}
      />
    </div>
  );
};
