import { SyntheticEvent, useContext } from "react";
import { createContext } from "@salt-ds/core";

export type InteractableCardValue = string | readonly string[] | undefined;
export type SelectionVariant = "single" | "multiselect";

export interface InteractableCardGroupContextValue {
  disabled?: boolean;
  select: (
    event: SyntheticEvent<HTMLDivElement>,
    value: InteractableCardValue
  ) => void;
  isSelected: (id: InteractableCardValue) => boolean;
  isFirstChild: (value: InteractableCardValue) => boolean;
  selectionVariant: SelectionVariant;
  value: InteractableCardValue;
}

export const InteractableCardGroupContext = createContext<
  InteractableCardGroupContextValue | undefined
>("InteractableCardGroupContext", undefined);

export function useInteractableCardGroup() {
  return useContext(InteractableCardGroupContext);
}
