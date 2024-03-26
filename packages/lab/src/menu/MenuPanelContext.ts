import { createContext } from "@salt-ds/core";
import { useContext } from "react";
import { MenuContextValue } from "./MenuContext";

export interface MenuPanelContextValue
  extends Pick<
    MenuContextValue,
    "getItemProps" | "activeIndex" | "setFocusInside"
  > {}

export const MenuPanelContext = createContext<MenuPanelContextValue>(
  "MenuPanelContext",
  {
    activeIndex: null,
    getItemProps: () => ({}),
    setFocusInside: () => undefined,
  }
);

export function useMenuPanelContext() {
  return useContext(MenuPanelContext);
}
