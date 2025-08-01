import {
  Banner,
  BannerContent,
  SaltProvider,
  SaltProviderNext,
  StackLayout,
  useTheme,
} from "@salt-ds/core";
import { AgGridReact } from "ag-grid-react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/ag-grid-theme/data
import { defaultColumns, defaultData } from "./data";
import { useAgGridHelpers } from "./useAgGridHelpers";

const statusBar = {
  statusPanels: [
    {
      statusPanel: "agTotalRowCountComponent",
      align: "left",
    },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
  ],
};

const HDCompactGrid = () => {
  const { mode } = useTheme();
  // We've created a local custom hook to set the rows and column sizes.
  // refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/ag-grid-theme/useAgGridHelpers.ts
  const { containerProps, agGridProps } = useAgGridHelpers(true);

  return (
    <StackLayout style={{ width: "100%" }}>
      <Banner>
        <BannerContent>
          Compact only works in high density, which is enforced here.
        </BannerContent>
      </Banner>
      <div {...containerProps}>
        <AgGridReact
          columnDefs={defaultColumns}
          rowData={defaultData}
          statusBar={statusBar}
          rowSelection="multiple"
          cellSelection={true}
          {...agGridProps}
        />
      </div>
    </StackLayout>
  );
};
export const HDCompact = () => {
  const { themeNext } = useTheme();
  const Provider = themeNext ? SaltProviderNext : SaltProvider;
  // Enforce a high density
  return (
    <Provider density="high" applyClassesTo="scope">
      <HDCompactGrid />
    </Provider>
  );
};
