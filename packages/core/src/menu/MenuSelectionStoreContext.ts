import { useContext } from "react";
import { createContext } from "../utils";

export interface MenuSelectionStore {
  getSelected: (name: string) => string[] | undefined;
  setSelected: (name: string, selected: string[]) => void;
}

export const MenuSelectionStoreContext = createContext<
  MenuSelectionStore | undefined
>("MenuSelectionStoreContext", undefined);

export function useMenuSelectionStore() {
  return useContext(MenuSelectionStoreContext);
}
