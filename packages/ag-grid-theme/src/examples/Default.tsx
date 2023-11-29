import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { StackLayout, useDensity, useTheme } from "@salt-ds/core";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import dataGridExampleData from "../dependencies/dataGridExampleData";
// import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const Default = (props: { defaultTheme: string }) => {
  const { defaultTheme = "salt" } = props;
  const { switcher } = useAgGridThemeSwitcher(defaultTheme);
  // const { agGridProps, containerProps } = useAgGridHelpers({
  //   agThemeName: `ag-theme-${themeName}`,
  // });


  const [isGridReady, setGridReady] = useState(false);
  const { mode } = useTheme();
  const density = useDensity()

  const apiRef = useRef<{ api: GridApi; columnApi: ColumnApi }>();
  const onGridReady = ({ api, columnApi }: GridReadyEvent) => {
    apiRef.current = { api, columnApi };
    api.sizeColumnsToFit();
    setGridReady(true);
  };

  useEffect(() => {
    // setHeaderHeight doesn't work if not in setTimeout
    setTimeout(() => {
    if (isGridReady) {
      // const rowHeight = apiRef.current!.api.getRowHeight()
      console.log('resetRowHeights');

      apiRef.current?.api.resetRowHeights();
      // apiRef.current!.api.setHeaderHeight(rowHeight);
      // apiRef.current!.api.setFloatingFiltersHeight(rowHeight);
    }
    }, 0);
  }, [density, isGridReady]);

  return (
    <StackLayout gap={4}>
      {switcher}

      <div className={`ag-theme-salt-${mode}`} style={{ height: 500, width: "800px" }}>
        {/* <div {...containerProps}> */}
        <AgGridReact
          columnDefs={[
            {
              headerName: "Name",
              field: "name",
              filterParams: {
                buttons: ["reset", "apply"],
              },
              editable: false,
              autoHeight: true,
            },
            {
              headerName: "Code",
              field: "code",
            },
            {
              headerName: "Capital",
              field: "capital",
            },
          ]}
          rowData={dataGridExampleData}
          rowSelection="single"
          onGridReady={onGridReady}
        // {...agGridProps}
        />
      </div>
    </StackLayout>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false, delay: 200 },
};

export default Default;
