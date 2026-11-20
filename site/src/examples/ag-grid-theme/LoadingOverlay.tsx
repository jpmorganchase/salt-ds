import { Card, Spinner, StackLayout, Text } from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns } from "./data";

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

export const LoadingOverlay = () => {
  return (
    <div
      className="ag-theme-salt"
      style={{ height: 500, width: "100%" }}
      tabIndex={-1}
    >
      <AgGridReact
        theme="legacy"
        autoSizeStrategy={{ type: "fitGridWidth" }}
        defaultColDef={{ filter: true }}
        columnDefs={defaultColumns}
        rowData={null}
        loadingOverlayComponent={CustomOverlay}
      />
    </div>
  );
};
