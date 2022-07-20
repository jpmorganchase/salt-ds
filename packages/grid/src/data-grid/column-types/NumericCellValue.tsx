import { isLeafNode } from "../DataGridModel";
import { KeyOfType } from "../../grid";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { DataGridCellValueProps } from "./DataGridCellValue";
import { NumericColumnData } from "./NumericColumnData";
import "./NumericCellValue.css";

const withBaseName = makePrefixer("uitkDataGridNumericCellValue");

const defaultPrecision = 2;

export const NumericCellValue = function NumericCellValue<
  TRowData,
  TColumnData
>(props: DataGridCellValueProps<TRowData, TColumnData>) {
  const { rowNode, column } = props;
  if (!isLeafNode(rowNode)) {
    return null;
  }
  const rowData: TRowData = rowNode.useData();
  const field = column.definition.field;
  const value = rowData[field as KeyOfType<TRowData, number>] as any as number;
  const numericColumnData = column.useData() as NumericColumnData;
  const precision =
    numericColumnData?.precision != null
      ? numericColumnData.precision
      : defaultPrecision;
  return (
    <div className={withBaseName()}>
      {value != null ? value.toFixed(precision) : ""}
    </div>
  );
};
