import { createContext, useContext } from "react";
import { DataGridModel } from "./DataGridModel";

export interface DataGridNextContext {
  dataGridModel: DataGridModel;
}

export const DataGridContext = createContext<DataGridNextContext | undefined>(
  undefined
);

export function useDataGridNextContext() {
  const c = useContext(DataGridContext);
  if (!c) {
    throw new Error(
      `useDataGridNextContext should be used within a DataGridNext`
    );
  }
  return c;
}
