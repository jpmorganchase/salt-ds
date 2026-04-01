import { createContext, useContext } from "react";

interface ListStateContextValue {
  state: any;
  helpers: any;
}

export const ListStateContext = createContext<
  ListStateContextValue | undefined
>(undefined);

export const useListStateContext = () => {
  const context = useContext(ListStateContext);

  if (!context) {
    throw new Error(
      "useListStateContext must be used inside of a ListStateContext Provider.",
    );
  }

  return context;
};
