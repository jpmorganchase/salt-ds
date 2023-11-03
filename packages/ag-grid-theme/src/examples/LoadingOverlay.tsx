import { CSSProperties } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { Card, Spinner, StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const LoadingOverlay = (props: AgGridReactProps) => {
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  const getModalStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    width: "100%",
    left: "50%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: "3",
    textAlign: "center",
    transform: "translate(-50%, -50%)",
  };

  return (
    <StackLayout gap={4}>
      {switcher}
      <div style={{ position: "relative" }}>
        <div className="modal" style={getModalStyle}>
          <Card style={{ minHeight: "auto" }}>
            <div>
              <Spinner style={{ margin: "0 auto" }} />
              <div
                aria-atomic="true"
                aria-live="polite"
                style={{ fontSize: "16px", marginTop: "18px" }}
                tabIndex={0}
              >
                Loading...
              </div>
            </div>
          </Card>
        </div>
        <div {...containerProps} tabIndex={-1}>
          <AgGridReact
            {...agGridProps}
            {...props}
            columnDefs={dataGridExampleColumns}
            rowData={dataGridExampleData}
          />
        </div>
      </div>
    </StackLayout>
  );
};

LoadingOverlay.parameters = {
  chromatic: { disableSnapshot: false, delay: 1000 },
};

export default LoadingOverlay;
