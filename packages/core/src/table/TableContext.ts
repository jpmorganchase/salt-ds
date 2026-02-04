import { useContext } from "react";
import { createContext } from "../utils";

export interface TableContextValue {
  id?: string;
  setId: (id: string) => void;
  labelledBy?: string;
  setLabelledBy: (labelId: string) => void;
}

export const TableContext = createContext<TableContextValue>("TableContext", {
  id: undefined,
  setId: () => {},
  labelledBy: undefined,
  setLabelledBy: () => {},
});

export function useTable() {
  return useContext(TableContext);
}
