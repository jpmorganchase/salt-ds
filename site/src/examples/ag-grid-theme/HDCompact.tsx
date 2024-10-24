import {
  Banner,
  BannerContent,
  SaltProvider,
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
  const className = `ag-theme-salt-high-compact-${mode}`;

  return (
    <StackLayout style={{ width: "100%" }}>
      <Banner>
        <BannerContent>
          Compact only works in high density, which is enforced here.
        </BannerContent>
      </Banner>
      <div {...containerProps} className={className}>
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
  // Enforce a high density
  return (
    <SaltProvider density="high">
      <HDCompactGrid />
    </SaltProvider>
  );
};
