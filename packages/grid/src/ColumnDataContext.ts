import { createContext, useContext } from "react";
import type { GridColumnModel } from "./Grid";

export interface ColumnDataContext<T> {
  getColById: (id: string) => GridColumnModel<T> | undefined;
}

export const ColumnDataContext = createContext<
  ColumnDataContext<any> | undefined
>(undefined);

export const useColumnDataContext = () => {
  const c = useContext(ColumnDataContext);
  if (!c) {
    throw new Error(`useColumnDataContext invoked outside of a Grid`);
  }
  return c;
};
