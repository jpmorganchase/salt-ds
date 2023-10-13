import { Banner, BannerContent, FlexLayout } from "@salt-ds/core";
import { clsx } from "clsx";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";

const VariantZebra = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-salt`,
  });
  const { className } = containerProps;

  return (
    <FlexLayout direction="column">
      <Banner status="info">
        <BannerContent>Variants are available in Salt theme only</BannerContent>
      </Banner>
      <div
        style={{ height: 500, width: 800, marginTop: 25 }}
        {...containerProps}
        className={clsx(className, "ag-theme-salt-variant-zebra")}
      >
        <AgGridReact
          {...agGridProps}
          {...props}
          rowData={dataGridExampleData}
          columnDefs={dataGridExampleColumns}
          rowSelection="multiple"
        />
      </div>
    </FlexLayout>
  );
};

VariantZebra.parameters = {
  chromatic: { disableSnapshot: false, delay: 500 },
};

export default VariantZebra;
