import { AgGridReact } from "ag-grid-react";
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

  const detailCellRenderer = () => (
    <div
      className={containerProps.className}
      style={{ height: "100%", padding: 20 }}
    >
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        {...agGridProps}
      ></AgGridReact>
    </div>
  );

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
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default MasterDetail;

export const MasterDetailUITK = () => <MasterDetail defaultTheme="uitk" />;

MasterDetailUITK.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};
