import { createContext, useContext } from "react";
import { DataSet } from "./model";

export interface DataGridContext {
  dataSet: DataSet;
}

export const DataGridContext = createContext<DataGridContext | undefined>(
  undefined
);

export function useDataGridContext() {
  const c = useContext(DataGridContext);
  if (!c) {
    throw new Error(`useDataGridContext should be used within a DataGrid`);
  }
  return c;
}
