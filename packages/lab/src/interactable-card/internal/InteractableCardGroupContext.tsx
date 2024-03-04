import { SyntheticEvent, useContext } from "react";
import { createContext } from "@salt-ds/core";

export type Value = string | readonly string[] | number | undefined;
export type SelectionVariant = "single" | "multiselect";

export interface InteractableCardGroupContextValue {
  disabled?: boolean;
  select: (event: SyntheticEvent<HTMLButtonElement>) => void;
  isSelected: (id: Value) => boolean;
  selectionVariant: SelectionVariant;
}

export const InteractableCardGroupContext = createContext<
  InteractableCardGroupContextValue | undefined
>("InteractableCardGroupContext", undefined);

export function useInteractableCardGroup() {
  return useContext(InteractableCardGroupContext);
}
