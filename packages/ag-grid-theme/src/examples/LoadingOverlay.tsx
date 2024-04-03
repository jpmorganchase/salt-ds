import { Card, Spinner, StackLayout, Text } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

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
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <StackLayout gap={4}>
      <div style={{ position: "relative" }}>
        <div {...containerProps} tabIndex={-1}>
          <AgGridReact
            {...agGridProps}
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
