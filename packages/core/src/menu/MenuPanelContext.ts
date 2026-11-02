import { useContext } from "react";
import { createContext } from "../utils";
import type { MenuContextValue } from "./MenuContext";

export interface MenuPanelContextValue
  extends Pick<
    MenuContextValue,
    "getItemProps" | "activeIndex" | "setFocusInside"
  > {
  hasSelectionIcon: boolean;
  registerPanelSelectionIcon: () => () => void;
}

export const MenuPanelContext = createContext<MenuPanelContextValue>(
  "MenuPanelContext",
  {
    activeIndex: null,
    getItemProps: () => ({}),
    setFocusInside: () => undefined,
    hasSelectionIcon: false,
    registerPanelSelectionIcon: () => () => undefined,
  },
);

export function useMenuPanelContext() {
  return useContext(MenuPanelContext);
}
