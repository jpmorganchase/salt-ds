import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { cellEditorsColumn } from "./data/cellEditorsColumn";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { dataGridExampleDataCellEditors } from "./data/cellEditorsData";
import { dateString } from "./data/cellEditorsDataTypes";
import { useAgGridHelpers } from "./useAgGridHelpers";

export const ProvidedCellEditors = (props: AgGridReactProps) => {
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={cellEditorsColumn}
        rowData={[...dataGridExampleDataCellEditors]}
        dataTypeDefinitions={{ dateString }}
      />
    </div>
  );
};
