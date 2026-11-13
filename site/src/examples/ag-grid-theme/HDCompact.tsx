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
  return (
    <StackLayout style={{ width: "100%" }}>
      <Banner>
        <BannerContent>
          Compact is intended for high density, which this example uses.
        </BannerContent>
      </Banner>
      <div
        className="ag-theme-salt-compact"
        style={{ height: 500, width: "100%" }}
      >
        <AgGridReact
          columnDefs={defaultColumns}
          rowData={defaultData}
          statusBar={statusBar}
          rowSelection="multiple"
          cellSelection={true}
          theme="legacy"
          autoSizeStrategy={{ type: "fitGridWidth" }}
          defaultColDef={{ filter: true }}
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
