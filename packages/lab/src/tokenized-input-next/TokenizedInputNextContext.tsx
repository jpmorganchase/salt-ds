import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface TokenizedInputNextContextValue {
  items?: string[];
  inputValue?: string;
}

export const TokenizedInputNextContext = createContext<TokenizedInputNextContextValue | undefined>(
  "TokenizedInputNextContext",
  undefined
);

export function useTokenizedInputContext() {
  return useContext(TokenizedInputNextContext);
}
