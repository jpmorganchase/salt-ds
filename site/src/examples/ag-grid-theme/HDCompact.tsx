import { ChangeEvent, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  StackLayout,
  Checkbox,
  useDensity,
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
