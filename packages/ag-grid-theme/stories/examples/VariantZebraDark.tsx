import { Banner, BannerContent, FlexLayout, SaltProvider } from "@salt-ds/core";
import { clsx } from "clsx";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";

const VariantZebraDark = (props: AgGridReactProps) => {
  const mode = "dark";
  const { agGridProps, containerProps } = useAgGridHelpers(
    `ag-theme-salt`,
    false,
    mode
  );
  const { className } = containerProps;

  return (
    <SaltProvider mode={mode}>
      <FlexLayout direction="column">
        <Banner status="info">
          <BannerContent>
            Variants are available in Salt theme only
          </BannerContent>
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
    </SaltProvider>
  );
};

VariantZebraDark.parameters = {
  chromatic: { disableSnapshot: false },
};

export default VariantZebraDark;
