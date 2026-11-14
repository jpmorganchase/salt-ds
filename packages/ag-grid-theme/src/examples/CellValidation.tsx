import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { validationCellExampleColumns } from "../dependencies/validationExampleColumns";
import { validationExampleData } from "../dependencies/validationExampleData";

export const CellValidation = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: 800 }}>
      <AgGridReact
        {...props}
        rowData={validationExampleData}
        columnDefs={validationCellExampleColumns}
      />
    </div>
  );
};
