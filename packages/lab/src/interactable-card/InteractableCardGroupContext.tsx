import { SyntheticEvent, useContext } from "react";
import { createContext } from "@salt-ds/core";

export type InteractableCardValue =
  | string
  | readonly string[]
  | number
  | undefined;
export type SelectionVariant = "single" | "multiselect";

export interface InteractableCardGroupContextValue {
  disabled?: boolean;
  select: (
    event: SyntheticEvent<HTMLDivElement>,
    value: InteractableCardValue
  ) => void;
  isSelected: (id: InteractableCardValue) => boolean;
  selectionVariant: SelectionVariant;
}

export const InteractableCardGroupContext = createContext<
  InteractableCardGroupContextValue | undefined
>("InteractableCardGroupContext", undefined);

export function useInteractableCardGroup() {
  return useContext(InteractableCardGroupContext);
}
