import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { coloredColumns, defaultData } from "./data";

const Coloration = (props: AgGridReactProps) => {
  const { containerProps, agGridProps } = useAgGridHelpers();

  return (
      <div {...containerProps}>
        <AgGridReact
          {...agGridProps}
          {...props}
          columnDefs={coloredColumns}
          rowData={defaultData}
        />
      </div>
  );
};

export default Coloration;
