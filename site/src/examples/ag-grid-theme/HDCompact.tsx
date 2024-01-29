import { AgGridReact } from "ag-grid-react";
import {
  StackLayout,
  useTheme,
  SaltProvider,
  Banner,
  BannerContent,
} from "@salt-ds/core";
import { useAgGridHelpers } from "./useAgGridHelpers";
import { defaultColumns, defaultData } from "./data";

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
  // We've created a local custom hook to set the rows and column sizes. For complete example check the `Default` example.
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
          enableRangeSelection={true}
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
