import { DataGridColumn } from "../DataGridModel";
import { HeaderValueProps } from "../../grid";
import { DefaultHeaderComponent } from "./DefaultHeaderComponent";

export interface DataGridColumnHeaderProps<TRowData, TColumnData> {
  column: DataGridColumn<TRowData, TColumnData>;
}

export const DataGridColumnHeader = function DataGridColumnHeader<
  TRowData,
  TColumnData
>(
  props: HeaderValueProps<TRowData, any, DataGridColumn<TRowData, TColumnData>>
) {
  const { column } = props;
  const dataGridColumn = column.useData();
  if (!dataGridColumn) {
    return null;
  }
  const C = dataGridColumn.definition.headerComponent || DefaultHeaderComponent;
  return <C column={dataGridColumn} />;
};
