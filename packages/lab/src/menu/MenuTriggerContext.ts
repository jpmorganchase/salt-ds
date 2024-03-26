import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export const MenuTriggerContext = createContext<boolean>(
  "MenuTriggerContext",
  false
);

export function useIsMenuTrigger() {
  return useContext(MenuTriggerContext);
}
