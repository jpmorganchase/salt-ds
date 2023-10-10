import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useCallback, useRef } from "react";
import { SaltProvider, StackLayout } from "@salt-ds/core";
import columnDefs from "../dependencies/masterDetailExampleData";
import rowData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const MasterDetailDark = (props: AgGridReactProps) => {
  const mode = "dark";
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers(
    `ag-theme-${themeName}`,
    false,
    mode
  );

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
    <SaltProvider mode={mode}>
      <StackLayout gap={4}>
        {switcher}
        <div {...containerProps}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            detailCellRendererParams={{
              detailGridOptions: { columnDefs },
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
              getDetailRowData: (params: any) =>
                params.successCallback(rowData),
            }}
            masterDetail={true}
            detailRowHeight={300}
            rowData={rowData}
            {...agGridProps}
            {...props}
            onFirstDataRendered={onFirstDataRendered}
          />
        </div>
      </StackLayout>
    </SaltProvider>
  );
};

MasterDetailDark.parameters = {
  chromatic: { disableSnapshot: false },
};

export default MasterDetailDark;
