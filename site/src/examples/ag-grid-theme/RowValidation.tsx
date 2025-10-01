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
import { useAgGridHelpers } from "./useAgGridHelpers";

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
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
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
