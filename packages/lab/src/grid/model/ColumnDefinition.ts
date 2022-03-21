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

export type CellValueGetter<T, U> = (rowData: T) => U;

// External representation of a column.
// There are two ways to customize cells:
// 1) cellComponent - renders a complete cell (<td> and everything).
// 2) cellValueComponent - renders the content of the cell. Doesn't include <td>
//    wrapped by BaseCell that takes care of selection, hover over etc.
//    Should be sufficient in most cases. Use cellComponent only when
//    cellComponentValue is not flexible enough.
export interface ColumnDefinition<T = any, U = any> {
  key: string;
  field?: KeyOfType<T, U>; // TODO remove
  cellValueGetter?: CellValueGetter<T, U>;
  title?: string;
  pinned?: ColumnPinType;
  width?: number;
  cellComponent?: ComponentType<CellProps<T, U>>;
  cellValueComponent?: ComponentType<CellValueProps<T, U>>;
  editorComponent?: ComponentType<EditorProps<T, U>>;
  headerComponent?: ComponentType<HeaderCellProps<T>>;
  headerValueComponent?: ComponentType<HeaderValueProps<T, U>>;
  toolbarComponent?: ComponentType<{}>;
}
