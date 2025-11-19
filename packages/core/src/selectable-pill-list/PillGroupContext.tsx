import { type SyntheticEvent, useContext } from "react";
import { createContext } from "../utils/createContext";

interface PillGroupContextValue {
  // focus management
  focusInside: boolean;
  selected: string[];
  select: (e: SyntheticEvent, value: string) => void;
  disabled?: boolean;
}

export const PillGroupContext = createContext<PillGroupContextValue | null>(
  "PillGroupContext",
  null,
);

export const usePillGroup = () => {
  return useContext(PillGroupContext);
};
