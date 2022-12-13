import { createContext, useContext } from "react";
import { CellRange, SelectRowsOptions } from "./internal";

export interface SelectionContext {
  selectedCellRange: CellRange | undefined;
  selRowIdxs: Set<number>;
  isAnySelected: boolean;
  isAllSelected: boolean;
  selectRows: (args: SelectRowsOptions) => void;
  selectAll: () => void;
  unselectAll: () => void;
}

export const SelectionContext = createContext<SelectionContext | undefined>(
  undefined
);

export const useSelectionContext = () => {
  const c = useContext(SelectionContext);
  if (!c) {
    throw new Error(`useSelectionContext invoked outside of a Grid`);
  }
  return c;
};
