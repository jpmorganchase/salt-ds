import { GridModel } from "./model";
import { createContext, useContext } from "react";

export interface GridContext {
  model: GridModel;
}

export const GridContext = createContext<GridContext | undefined>(undefined);

export function useGridContext() {
  const c = useContext(GridContext);
  if (!c) {
    throw new Error(`useGridContext should be used within a Grid`);
  }
  return c;
}
