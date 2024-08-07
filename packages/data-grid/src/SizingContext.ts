import type { MouseEvent } from "react";
import { createContext, useContext } from "react";

export interface SizingContext {
  rowHeight: number;
  resizeColumn: (colIdx: number, width: number) => void;
  onResizeHandleMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
}

export const SizingContext = createContext<SizingContext | undefined>(
  undefined,
);
export const useSizingContext = () => {
  const c = useContext(SizingContext);
  if (!c) {
    throw new Error("useSizingContext invoked outside of a Grid");
  }
  return c;
};
