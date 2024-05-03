import { useContext } from "react";
import { MenuContextValue } from "./MenuContext";
import { createContext } from "../utils";

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
