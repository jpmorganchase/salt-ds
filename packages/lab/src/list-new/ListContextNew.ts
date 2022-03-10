import { createContext, useContext } from "react";
import { ListModelNew } from "./ListModelNew";

export interface ListContextNew {
  listModel: ListModelNew;
}

export const ListContextNew = createContext<ListContextNew | undefined>(
  undefined
);

export function useListContextNew(): ListContextNew {
  const context = useContext(ListContextNew);
  if (!context) {
    throw new Error("useListContextNew should be used inside a ListNew");
  }
  return context;
}
