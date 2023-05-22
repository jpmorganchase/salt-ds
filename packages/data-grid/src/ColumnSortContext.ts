import React, { createContext, useContext } from "react";
import { SortOrder } from "./Grid";
import { GridColumnProps } from "./GridColumn";

export interface ColumnSortContext {
  sortByColumnId?: GridColumnProps["id"];
  setSortByColumnId: (c: React.SetStateAction<GridColumnProps["id"]>) => void;
  sortOrder: SortOrder;
  setSortOrder: (o: SortOrder) => void;
  onClickSortColumn: (colHeaderId: GridColumnProps["id"]) => void;
}

export const ColumnSortContext = createContext<ColumnSortContext | undefined>(
  undefined
);

export const useColumnSortContext = () => {
  const c = useContext(ColumnSortContext);
  if (!c) {
    throw new Error(`useColumnSortContext invoked outside of a Grid`);
  }
  return c;
};
