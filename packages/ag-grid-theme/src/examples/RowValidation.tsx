import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import {
  validationRowClassRules,
  validationRowExampleColumns,
} from "../dependencies/validationExampleColumns";
import { validationExampleData } from "../dependencies/validationExampleData";

export const RowValidation = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        rowData={validationExampleData}
        columnDefs={validationRowExampleColumns}
        rowClassRules={validationRowClassRules}
        rowSelection="multiple"
      />
    </div>
  );
};
