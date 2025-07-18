import { createContext } from "@salt-ds/core";
import { type SyntheticEvent, useContext } from "react";

export type CollapsibleContextValue = {
  open: boolean;
  setOpen: (event: SyntheticEvent<HTMLButtonElement>, open: boolean) => void;
  panelId?: string;
  setPanelId?: (panelId: string) => void;
};

export const CollapsibleContext = createContext<CollapsibleContextValue>(
  "CollapsibleContext",
  {
    open: false,
    setOpen: () => {},
    panelId: undefined,
    setPanelId: () => {},
  },
);

export function useCollapsibleContext() {
  return useContext(CollapsibleContext);
}
