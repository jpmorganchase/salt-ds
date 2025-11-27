import { type SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";

export interface PillGroupContextValue {
  selected: string[];
  select: (e: SyntheticEvent, value: string) => void;
  disabled?: boolean;
  selectionVariant: "none" | "multiple";
}

export const PillGroupContext = createContext<PillGroupContextValue>(
  "PillGroupContext",
  {
    selected: [],
    select: () => {},
    selectionVariant: "none",
  },
);

export function usePillGroup() {
  return useContext(PillGroupContext);
}
