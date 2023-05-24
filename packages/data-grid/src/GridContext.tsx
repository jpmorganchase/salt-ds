import type { GridColumnInfo } from "./GridColumn";
import { createContext, useContext } from "react";
import type { ColumnGroupProps } from "./ColumnGroup";
import type { CellEditorInfo } from "./CellEditor";

export interface GridContext<T> {
  getChildIndex: (columnId: string) => number;

  onColumnAdded: (columnInfo: GridColumnInfo<T>) => void;
  onColumnRemoved: (index: number, columnInfo: GridColumnInfo<T>) => void;
  onColumnGroupAdded: (colGroupProps: ColumnGroupProps) => void;
  onColumnGroupRemoved: (
    index: number,
    colGroupProps: ColumnGroupProps
  ) => void;

  onEditorAdded: (editorInfo: CellEditorInfo<T>) => void;
  onEditorRemoved: (editorInfo: CellEditorInfo<T>) => void;

  getEditor: (columnId: string) => CellEditorInfo<T> | undefined;
}

export const GridContext = createContext<GridContext<any> | undefined>(
  undefined
);

export const useGridContext = () => {
  const c = useContext(GridContext);
  if (!c) {
    throw new Error(`useGridContext invoked outside of a Grid`);
  }
  return c;
};
