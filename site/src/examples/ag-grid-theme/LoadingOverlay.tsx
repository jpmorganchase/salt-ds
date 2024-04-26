import { Card, Spinner, StackLayout, Text } from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
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
