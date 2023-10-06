import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import columnDefs from "../dependencies/masterDetailExampleData";
import rowData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const MasterDetail = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers(
    `ag-theme-${themeName}`
  );

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          columnDefs={columnDefs}
          detailCellRendererParams={{
            detailGridOptions: { columnDefs },
            getDetailRowData: (params: any) => params.successCallback(rowData),
          }}
          masterDetail={true}
          detailRowHeight={300}
          rowData={rowData}
          {...agGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};

MasterDetail.parameters = {
  chromatic: { disableSnapshot: false },
};

export default MasterDetail;
