import { useContext } from "react";
import { createContext } from "@salt-ds/core";

export type Value = string | readonly string[] | number | undefined;

export interface InteractableCardGroupContextValue {
  select: (value: Value) => void;
  isSelected: (id: Value) => boolean;
}

export const InteractableCardGroupContext = createContext<
  InteractableCardGroupContextValue | undefined
>("InteractableCardGroupContext", undefined);

export function useInteractableCardGroup() {
  return useContext(InteractableCardGroupContext);
}
