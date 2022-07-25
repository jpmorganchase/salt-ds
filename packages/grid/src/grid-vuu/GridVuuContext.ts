import { createContext, useContext } from "react";

export interface GridVuuContext {}

export const GridVuuContext = createContext<GridVuuContext | undefined>(
  undefined
);

export function useGridVuuContext(): GridVuuContext {
  const c = useContext(GridVuuContext);
  if (!c) {
    throw new Error(`useGridVuuContext should be used within a GridVuu`);
  }
  return c;
}
