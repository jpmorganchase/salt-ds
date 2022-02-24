import { createContext, useContext } from "react";

export const ListStateContext = createContext();

export const useListStateContext = () => {
  const context = useContext(ListStateContext);

  if (!context) {
    throw new Error(
      "useListStateContext must be used inside of a ListStateContext Provider."
    );
  }

  return context;
};
