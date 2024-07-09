import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleRowGroupPanel from "../dependencies/dataGridExampleRowGroupPanel";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const RowGroupPanel = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        columnDefs={dataGridExampleRowGroupPanel}
        defaultColDef={{
          enableRowGroup: true,
        }}
        rowData={dataGridExampleData}
        rowGroupPanelShow="always"
      />
    </div>
  );
};
export default RowGroupPanel;
