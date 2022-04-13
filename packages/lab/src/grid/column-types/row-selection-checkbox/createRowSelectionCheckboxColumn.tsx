import {
  CellValueProps,
  ColumnDefinition,
  HeaderValueProps,
} from "../../model";
import { RowSelectionCheckboxCellValue } from "./RowSelectionCheckboxCellValue";
import { ComponentType } from "react";
import { RowSelectionCheckboxHeaderValue } from "./RowSelectionCheckboxHeaderValue";

// TODO remove this ?
export function createRowSelectionCheckboxColumn<T>(): ColumnDefinition<T> {
  return {
    key: "rowSelection",
    title: "",
    width: 100,
    pinned: "left",
    cellValueComponent: RowSelectionCheckboxCellValue as ComponentType<
      CellValueProps<T>
    >,
    headerValueComponent: RowSelectionCheckboxHeaderValue as ComponentType<
      HeaderValueProps<T>
    >,
  };
}
