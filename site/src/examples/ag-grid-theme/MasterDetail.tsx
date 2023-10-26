import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultData, masterDetailColumns } from "./data";

export const MasterDetail = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps}>
      <AgGridReact
        columnDefs={masterDetailColumns}
        detailCellRendererParams={{
          detailGridOptions: { columnDefs: masterDetailColumns },
          getDetailRowData: (params: {
            successCallback: (rowData: typeof defaultData) => void;
          }) => params.successCallback(defaultData),
        }}
        masterDetail={true}
        detailRowHeight={300}
        rowData={defaultData}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};
