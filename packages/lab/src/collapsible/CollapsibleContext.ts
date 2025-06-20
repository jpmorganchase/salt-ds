import { createContext } from "@salt-ds/core";
import { type SyntheticEvent, useContext } from "react";

export type CollapsibleContextValue = {
  expanded: boolean;
  setExpanded: (
    event: SyntheticEvent<HTMLButtonElement>,
    expanded: boolean,
  ) => void;
  disabled?: boolean;
  panelId?: string;
  setPanelId?: (panelId: string) => void;
};

export const CollapsibleContext = createContext<CollapsibleContextValue>(
  "CollapsibleContext",
  {
    expanded: false,
    setExpanded: () => {},
    disabled: false,
    panelId: undefined,
    setPanelId: () => {},
  },
);

export function useCollapsibleContext() {
  return useContext(CollapsibleContext);
}
