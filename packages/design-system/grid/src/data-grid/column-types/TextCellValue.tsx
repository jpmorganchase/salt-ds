import { isLeafNode } from "../DataGridModel";
import { DataGridCellValueProps } from "./DataGridCellValue";

export const TextCellValue = function TextCellValue<TRowData, TColumnData>(
  props: DataGridCellValueProps<TRowData, TColumnData>
) {
  const { rowNode, column } = props;
  if (isLeafNode(rowNode)) {
    const rowData: TRowData = rowNode.useData();
    const field = column.definition.field;
    const value = rowData[field as keyof TRowData];
    return <>{value}</>;
  }
  return null;
};
