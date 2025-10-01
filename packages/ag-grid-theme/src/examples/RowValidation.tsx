import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import {
  validationRowClassRules,
  validationRowExampleColumns,
} from "../dependencies/validationExampleColumns";
import { validationExampleData } from "../dependencies/validationExampleData";

export const RowValidation = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers({});

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        rowData={validationExampleData}
        columnDefs={validationRowExampleColumns}
        rowClassRules={validationRowClassRules}
        rowSelection="multiple"
      />
    </div>
  );
};
