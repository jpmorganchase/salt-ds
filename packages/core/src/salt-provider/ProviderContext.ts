import type { WindowContextType } from "@salt-ds/window";
import { createContext } from "../utils/createContext";

export interface ProviderContext {
  targetWindow: WindowContextType;
}

export const ProviderContext = createContext<ProviderContext | null>(
  "ProviderContext",
  null,
);
