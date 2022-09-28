import { createContext, useContext } from "react";

export interface CursorContext {
  cursorRowKey: string | undefined;
  cursorColKey: string | undefined;
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
