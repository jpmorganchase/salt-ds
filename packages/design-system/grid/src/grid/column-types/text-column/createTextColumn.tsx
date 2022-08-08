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
  pinned?: ColumnPinType,
  isEditable?: boolean
): ColumnDefinition<T, string> {
  return {
    key,
    title,
    field,
    width,
    pinned,
    isEditable,
    cellValueComponent: TextCellValue as ComponentType<
      CellValueProps<T, string>
    >,
    editorComponent: TextCellEditor,
  };
}
