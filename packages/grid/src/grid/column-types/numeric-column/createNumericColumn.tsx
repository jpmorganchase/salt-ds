import {
  CellValueProps,
  ColumnDefinition,
  ColumnPinType,
  KeyOfType,
} from "../../model";
import { ComponentType } from "react";
import { NumericCellValue } from "./NumericCellValue";

export function createNumericColumn<T>(
  key: string,
  title: string,
  field: KeyOfType<T, number>,
  width?: number,
  pinned?: ColumnPinType
): ColumnDefinition<T, number> {
  return {
    key,
    title,
    field,
    width,
    pinned,
    cellValueComponent: NumericCellValue as ComponentType<
      CellValueProps<T, number>
    >,
  };
}
