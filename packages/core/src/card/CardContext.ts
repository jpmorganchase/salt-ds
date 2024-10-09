import { type Dispatch, type SetStateAction, useContext } from "react";
import { createContext } from "../utils";

export interface CardContextValue {
  setPadding: Dispatch<SetStateAction<boolean>>;
}

export const CardContext = createContext<CardContextValue>("CardContext", {
  setPadding: () => undefined,
});

export function useCardContext() {
  return useContext(CardContext);
}
