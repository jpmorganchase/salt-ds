import { isLeafNode } from "../DataGridModel";
import { makePrefixer, Pill } from "@jpmorganchase/uitk-core";
import "./PillCellValue.css";
import { DataGridCellValueProps } from "./DataGridCellValue";

const withBaseName = makePrefixer("uitkDataGridPillCellValue");

export const PillCellValue = function BreadcrumbsCellValue<
  TRowData,
  TColumnData
>(props: DataGridCellValueProps<TRowData, TColumnData>) {
  const { rowNode, column } = props;
  if (isLeafNode(rowNode)) {
    const rowData: TRowData = rowNode.useData();
    const field = column.definition.field;
    const value = rowData[field as keyof TRowData] as any as string[];
    return (
      <>
        {value.map((x) => (
          <Pill key={x} label={x} className={withBaseName("pill")} />
        ))}
      </>
    );
  }
  return null;
};
