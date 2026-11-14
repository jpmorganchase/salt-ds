import { Card, Spinner, StackLayout, Text } from "@salt-ds/core";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";

const CustomOverlay = () => (
  <Card>
    <StackLayout gap={2} align="center">
      <Spinner />
      <Text aria-atomic="true" aria-live="polite">
        Loading...
      </Text>
    </StackLayout>
  </Card>
);

const LoadingOverlay = (props: AgGridReactProps) => {
  return (
    <StackLayout gap={4}>
      <div style={{ position: "relative" }}>
        <div
          className="ag-theme-salt"
          style={{ height: 500, width: 800 }}
          tabIndex={-1}
        >
          <AgGridReact
            {...props}
            columnDefs={dataGridExampleColumns}
            loadingOverlayComponent={CustomOverlay}
            rowData={undefined}
          />
        </div>
      </div>
    </StackLayout>
  );
};

export default LoadingOverlay;
