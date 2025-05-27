import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { validationCellExampleColumns } from "../dependencies/validationExampleColumns";
import { validationExampleData } from "../dependencies/validationExampleData";

export const CellValidation = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers({});

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
