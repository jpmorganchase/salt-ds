import { useContext } from "react";
import { createContext } from "../utils";
import type { MenuContextValue } from "./MenuContext";

export interface MenuPanelContextValue
  extends Pick<
    MenuContextValue,
    "getItemProps" | "activeIndex" | "setFocusInside"
  > {
  reserveIconSpace: boolean;
  reserveSelectionIconSpace: boolean;
  registerIcon: () => () => void;
  registerSelectionIcon: () => () => void;
}

export const MenuPanelContext = createContext<MenuPanelContextValue>(
  "MenuPanelContext",
  {
    activeIndex: null,
    getItemProps: () => ({}),
    setFocusInside: () => undefined,
    reserveIconSpace: false,
    reserveSelectionIconSpace: false,
    registerIcon: () => () => undefined,
    registerSelectionIcon: () => () => undefined,
  },
);

export function useMenuPanelContext() {
  return useContext(MenuPanelContext);
}
