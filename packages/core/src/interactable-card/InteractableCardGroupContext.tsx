import { SyntheticEvent, useContext } from "react";
import { createContext } from "../utils";

export type InteractableCardValue = string | readonly string[] | undefined;

export interface InteractableCardGroupContextValue {
  disabled?: boolean;
  select: (
    event: SyntheticEvent<HTMLDivElement>,
    value: InteractableCardValue
  ) => void;
  isSelected: (id: InteractableCardValue) => boolean;
  isFirstChild: (value: InteractableCardValue) => boolean;
  multiSelect?: boolean;
  value: InteractableCardValue;
}

export const InteractableCardGroupContext = createContext<
  InteractableCardGroupContextValue | undefined
>("InteractableCardGroupContext", undefined);

export function useInteractableCardGroup() {
  return useContext(InteractableCardGroupContext);
}
