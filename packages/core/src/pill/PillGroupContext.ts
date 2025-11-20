import { type SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";

export interface PillGroupContextValue {
  focusInside: boolean;
  selected: string[];
  select: (e: SyntheticEvent, value: string) => void;
  disabled?: boolean;
}

export const PillGroupContext = createContext<PillGroupContextValue | null>(
  "PillGroupContext",
  null,
);

export function usePillGroup() {
  return useContext(PillGroupContext);
}
