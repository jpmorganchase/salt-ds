import { ComponentType } from "react";
import {
  CellProps,
  CellValueProps,
  EditorProps,
  KeyOfType,
  HeaderValueProps,
} from "./GridModel";
import { HeaderCellProps } from "../components";

export type ColumnPinType = "left" | "right" | null;

export type CellValueGetter<TRowData, TCellValue> = (
  rowData: TRowData
) => TCellValue;

export interface ColumnDefinition<
  TRowData = any,
  TCellValue = any,
  TColumnData = any
> {
  key: string;
  field?: KeyOfType<TRowData, TCellValue>; // TODO remove
  cellValueGetter?: CellValueGetter<TRowData, TCellValue>;
  title?: string;
  pinned?: ColumnPinType;
  isEditable?: boolean;
  width?: number;
  cellComponent?: ComponentType<CellProps<TRowData, TCellValue>>;
  cellValueComponent?: ComponentType<CellValueProps<TRowData, TCellValue>>;
  editorComponent?: ComponentType<EditorProps<TRowData, TCellValue>>;
  headerComponent?: ComponentType<HeaderCellProps<TRowData>>;
  headerClassName?: string;
  headerValueComponent?: ComponentType<HeaderValueProps<TRowData, TCellValue>>;
  toolbarComponent?: ComponentType<{}>;
  data?: TColumnData;
}
