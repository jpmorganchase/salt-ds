import { createContext } from "@salt-ds/core";
import { type SyntheticEvent, useContext } from "react";

export type CollapsibleContextValue = {
  open: boolean;
  setOpen: (event: SyntheticEvent<HTMLButtonElement>, open: boolean) => void;
  disabled?: boolean;
  panelId?: string;
  setPanelId?: (panelId: string) => void;
};

export const CollapsibleContext = createContext<CollapsibleContextValue>(
  "CollapsibleContext",
  {
    open: false,
    setOpen: () => {},
    disabled: false,
    panelId: undefined,
    setPanelId: () => {},
  },
);

export function useCollapsibleContext() {
  return useContext(CollapsibleContext);
}
