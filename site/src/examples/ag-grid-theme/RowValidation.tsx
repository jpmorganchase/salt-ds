import { StatusIndicator, type ValidationStatus } from "@salt-ds/core";
import {
  AgGridReact,
  type AgGridReactProps,
  type CustomCellRendererProps,
} from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import {
  validationExampleData,
  validationRowClassRules,
  validationRowExampleColumns,
} from "./data";

const supportedStatuses = ["success", "error", "warning"] as const;
const StatusRenderer = (
  props: CustomCellRendererProps<
    unknown,
    Exclude<ValidationStatus, "info"> | null
  >,
) => {
  const { value } = props;
  if (!value || !supportedStatuses.includes(value)) {
    return null;
  }
  const status = value as ValidationStatus;
  return <StatusIndicator status={status} />;
};

export const RowValidation = (props: AgGridReactProps) => {
  return (
    <div className="ag-theme-salt" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        defaultColDef={{ filter: true }}
        {...props}
        rowData={validationExampleData}
        columnDefs={validationRowExampleColumns}
        rowClassRules={validationRowClassRules}
        rowSelection="multiple"
        components={{ statusRenderer: StatusRenderer }}
      />
    </div>
  );
};
