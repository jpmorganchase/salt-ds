import { createContext, type MouseEventHandler, useContext } from "react";

export interface ColumnDragContext {
  columnMove?: boolean;
  onColumnMoveHandleMouseDown: MouseEventHandler<HTMLDivElement>;
}

export const ColumnDragContext = createContext<ColumnDragContext | undefined>(
  undefined,
);

export const useColumnDragContext = () => {
  const c = useContext(ColumnDragContext);
  if (!c) {
    throw new Error("useColumnDragContext invoked outside of a Grid");
  }
  return c;
};
