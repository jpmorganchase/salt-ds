import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useCallback, useRef } from "react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import rowData from "../dependencies/dataGridExampleData";
import columnDefs from "../dependencies/masterDetailExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const MasterDetail = (props: AgGridReactProps) => {
  const { themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  const gridRef = useRef<AgGridReact>(null);

  const onFirstDataRendered = useCallback(() => {
    requestAnimationFrame(function () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const node = gridRef.current?.api.getDisplayedRowAtIndex(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      node?.setExpanded(true);
    });
  }, []);

  return (
    <div {...containerProps}>
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        detailCellRendererParams={{
          detailGridOptions: { columnDefs },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
          getDetailRowData: (params: any) => params.successCallback(rowData),
        }}
        masterDetail={true}
        detailRowHeight={300}
        rowData={rowData}
        {...agGridProps}
        {...props}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );
};

MasterDetail.parameters = {
  chromatic: { disableSnapshot: false },
};

export default MasterDetail;
