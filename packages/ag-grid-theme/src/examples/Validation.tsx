import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import {validationExampleColumns, validationRowClassRules} from "../dependencies/validationExampleColumns";
import {validationExampleData} from "../dependencies/validationExampleData";

const Validation = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers({});

  return (
    <div
      {...containerProps}
    >
      <AgGridReact
        {...agGridProps}
        {...props}
        rowData={validationExampleData}
        columnDefs={validationExampleColumns}
        rowClassRules={validationRowClassRules}
      />
    </div>
  );
};

export default Validation;
