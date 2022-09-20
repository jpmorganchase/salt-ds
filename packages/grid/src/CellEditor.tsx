import { ReactNode, useEffect, useMemo } from "react";
import { useGridContext } from "./GridContext";

export interface CellEditorInfo<T> {
  columnId: string;
  children: ReactNode;
}

export interface CellEditorProps<T> {
  columnId?: string;
  children: ReactNode;
}

// Non-rendered component. Used as a child of GridColumn. Children prop is
// expected to be a specific implementation of cell editor (text, dropdown etc)
// Registers the editor in the grid. The grid then renders the editor when
// edit mode is activated.
// TODO This feature is experimental.
export function CellEditor<T>(props: CellEditorProps<T>) {
  const { children } = props;
  const columnId = props.columnId!;
  const grid = useGridContext();

  const info = useMemo(
    () => ({
      columnId,
      children,
    }),
    [columnId, children]
  );

  useEffect(() => {
    grid.onEditorAdded(info);
    return () => {
      grid.onEditorRemoved(info);
    };
  }, [info]);

  return null;
}
