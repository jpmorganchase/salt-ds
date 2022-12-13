import { createContext, useContext } from "react";

export type FocusedPart = "header" | "body";

export interface CursorContext {
  isFocused: boolean;
  cursorRowIdx: number | undefined;
  cursorColIdx: number | undefined;
  moveCursor: (part: FocusedPart, rowIdx: number, colIdx: number) => void;
  focusedPart: FocusedPart;
  headerIsFocusable: boolean;
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
