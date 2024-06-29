import { useContext } from "react";
import { createContext } from "../utils";

export interface MenuTriggerContextValue {
  triggersSubmenu: boolean;
  blurActive: boolean;
}

export const MenuTriggerContext = createContext<MenuTriggerContextValue>(
  "MenuTriggerContext",
  { triggersSubmenu: false, blurActive: false },
);

export function useIsMenuTrigger() {
  return useContext(MenuTriggerContext);
}
