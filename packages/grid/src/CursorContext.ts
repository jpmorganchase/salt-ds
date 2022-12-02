import { createContext, useContext } from "react";

export interface CursorContext {
  isFocused: boolean;
  cursorRowIdx: number | undefined;
  cursorColIdx: number | undefined;
  moveCursor: (rowIdx: number, colIdx: number) => void;
}

export const CursorContext = createContext<CursorContext | undefined>(
  undefined
);
export const useCursorContext = () => {
  const c = useContext(CursorContext);
  if (!c) {
    throw new Error(`useCursorContext invoked outside of a Grid`);
  }
  return c;
};
