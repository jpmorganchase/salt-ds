import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { clsx } from "clsx";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const VariantZebra = (props: AgGridReactProps) => {
  const { agGridProps, containerProps } = useAgGridHelpers({});
  const { className } = containerProps;

  return (
    <div
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
  );
};

export default VariantZebra;
