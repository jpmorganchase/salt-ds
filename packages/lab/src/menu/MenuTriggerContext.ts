import { createContext } from "@salt-ds/core";
import { useContext } from "react";

export interface MenuTriggerContextValue {
  triggersSubmenu: boolean;
  blurActive: boolean;
}

export const MenuTriggerContext = createContext<MenuTriggerContextValue>(
  "MenuTriggerContext",
  { triggersSubmenu: false, blurActive: false }
);

export function useIsMenuTrigger() {
  return useContext(MenuTriggerContext);
}
