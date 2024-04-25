import { Card, Spinner, StackLayout, Text } from "@salt-ds/core";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
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
  const { switcher, themeName } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps} tabIndex={-1}>
        <AgGridReact
          {...agGridProps}
          {...props}
          columnDefs={dataGridExampleColumns}
          rowData={null}
          loadingOverlayComponent={CustomOverlay}
        />
      </div>
    </StackLayout>
  );
};

LoadingOverlay.parameters = {
  chromatic: { disableSnapshot: false },
};

export default LoadingOverlay;
