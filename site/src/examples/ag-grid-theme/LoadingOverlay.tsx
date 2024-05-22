import { Card, Spinner, StackLayout, Text } from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

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
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { agGridProps, containerProps } = useAgGridHelpers();

  return (
    <div {...containerProps} tabIndex={-1}>
      <AgGridReact
        {...agGridProps}
        columnDefs={defaultColumns}
        rowData={null}
        loadingOverlayComponent={CustomOverlay}
      />
    </div>
  );
};
