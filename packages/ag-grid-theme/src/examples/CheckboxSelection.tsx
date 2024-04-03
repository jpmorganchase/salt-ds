import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const CheckboxSelection = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        {...agGridProps}
        {...props}
        rowData={dataGridExampleData}
        columnDefs={dataGridExampleColumns}
        rowSelection="multiple"
        onFirstDataRendered={(params) => {
          params.api.forEachNode((node, index) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (node.data && index < 7 && index > 2) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              node.setSelected(true);
            }
          });
        }}
      />
    </div>
  );
};

export default CheckboxSelection;
