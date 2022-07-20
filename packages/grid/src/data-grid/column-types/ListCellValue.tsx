import { isLeafNode } from "../DataGridModel";
import { DataGridCellValueProps } from "./DataGridCellValue";

export const ListCellValue = function ListCellValue<TRowData, TColumnData>(
  props: DataGridCellValueProps<TRowData, TColumnData>
) {
  const { rowNode, column } = props;
  if (isLeafNode(rowNode)) {
    const rowData: TRowData = rowNode.useData();
    const field = column.definition.field;
    const value = rowData[field as keyof TRowData] as any as string[];
    return <>{value.join(", ")}</>;
  }
  return null;
};
