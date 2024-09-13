import { type Dispatch, type SetStateAction, useContext } from "react";
import { createContext } from "../utils";

export interface CardContextValue {
  /**
   * Set by `CardContent` to suppress the wrapping card's default inner padding.
   *
   * This is the JavaScript fallback for browsers that do not support
   * the CSS `:has()` selector. Provided by `Card`, `LinkCard` and
   * `InteractableCard` so that a single `CardContent` works inside any of them.
   */
  setNoPadding: Dispatch<SetStateAction<boolean>>;
}

export const CardContext = createContext<CardContextValue>("CardContext", {
  setNoPadding: () => undefined,
});

export function useCardContext() {
  return useContext(CardContext);
}
