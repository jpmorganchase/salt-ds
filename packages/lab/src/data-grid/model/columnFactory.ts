import { ColumnDefinition } from "../../grid";
import {
  DataSetColumn,
  DataSetNumericColumnDefinition,
  DataSetPriceColumnDefinition,
  DataSetRow,
  DataSetTextColumnDefinition,
  DataSetTreeColumnDefinition,
} from "./DataSet";
import {
  NumericCellValue,
  PriceCellValue,
  TextCellValue,
  TextHeaderValue,
  TreeCellValue,
} from "../column-types";
import { TextCellEditor } from "../../grid/column-types/text-column/TextCellEditor";

export function createGridColumnDefinitions<T>(columns: DataSetColumn<T>[]) {
  const columnDefinitions: ColumnDefinition[] = columns.map((column) => {
    if (column.type === "text") {
      return createTextColumnDefinition(column);
    }
    if (column.type === "numeric") {
      return createNumericColumnDefinition(column);
    }
    if (column.type === "tree") {
      return createTreeColumnDefinition(column);
    }
    if (column.type === "price") {
      return createPriceColumnDefinition(column);
    }
    throw new Error(`Unexpected column type: ${column.type}`);
  });
  return columnDefinitions;
}

export function createTextColumnDefinition<T>(column: DataSetColumn<T>) {
  const { key } = column;
  const definition = column.definition as DataSetTextColumnDefinition<T>;
  const result: ColumnDefinition<DataSetRow<T>> = {
    key,
    pinned: definition.pinned,
    cellValueComponent: TextCellValue,
    headerValueComponent: TextHeaderValue,
    cellValueGetter: (rowData) => rowData.fields.get(key),
    editorComponent: TextCellEditor,
  };
  return result;
}

export function createNumericColumnDefinition<T>(column: DataSetColumn<T>) {
  const { key } = column;
  const definition = column.definition as DataSetNumericColumnDefinition<T>;
  const result: ColumnDefinition<DataSetRow<T>> = {
    key,
    pinned: definition.pinned,
    cellValueComponent: NumericCellValue,
    headerValueComponent: TextHeaderValue,
    cellValueGetter: (rowData) => rowData.fields.get(key),
  };
  return result;
}

export function createTreeColumnDefinition<T>(column: DataSetColumn<T>) {
  const { key } = column;
  const definition = column.definition as DataSetTreeColumnDefinition<T>;
  const result: ColumnDefinition<DataSetRow<T>> = {
    key,
    pinned: definition.pinned,
    cellValueComponent: TreeCellValue,
    headerValueComponent: TextHeaderValue,
    cellValueGetter: (rowData) => rowData.treeField,
  };
  return result;
}

export function createPriceColumnDefinition<T>(column: DataSetColumn<T>) {
  const { key } = column;
  const definition = column.definition as DataSetPriceColumnDefinition<T>;
  const result: ColumnDefinition<DataSetRow<T>> = {
    key,
    pinned: definition.pinned,
    cellValueComponent: PriceCellValue,
    headerValueComponent: TextHeaderValue,
    cellValueGetter: (rowData) => rowData.fields.get(key),
  };
  return result;
}
