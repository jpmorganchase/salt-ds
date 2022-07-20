import { DataGridColumn, RowNode } from "../DataGridModel";
import { CellValueProps } from "../../grid";
import { TextCellValue } from "./TextCellValue";

export interface DataGridCellValueProps<TRowData, TColumnData> {
  rowNode: RowNode<TRowData>;
  column: DataGridColumn<TRowData, TColumnData>;
}

export const DataGridCellValue = function DataGridCellValue<
  TRowData,
  TColumnData
>(
  props: CellValueProps<
    RowNode<TRowData>,
    any,
    DataGridColumn<TRowData, TColumnData>
  >
) {
  const { row, column } = props;
  const rowNode: RowNode<TRowData> = row.useData();
  const dataGridColumn = column.useData();
  if (!rowNode || !dataGridColumn) {
    return null;
  }
  const CellValueComp =
    dataGridColumn.definition.cellComponent || TextCellValue;
  return <CellValueComp rowNode={rowNode} column={dataGridColumn} />;
};
