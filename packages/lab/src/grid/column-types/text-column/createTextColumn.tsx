import {
  CellValueProps,
  ColumnDefinition,
  ColumnPinType,
  KeyOfType,
} from "../../model";
import { TextCellValue } from "./TextCellValue";
import { TextCellEditor } from "./TextCellEditor";
import { ComponentType } from "react";

export function createTextColumn<T>(
  key: string,
  title: string,
  field: KeyOfType<T, string>,
  width?: number,
  pinned?: ColumnPinType
): ColumnDefinition<T, string> {
  return {
    key,
    title,
    field,
    width,
    pinned,
    cellValueComponent: TextCellValue as ComponentType<
      CellValueProps<T, string>
    >,
    editorComponent: TextCellEditor,
  };
}
