import { createContext, useFloatingUI } from "@salt-ds/core";
import { CSSProperties, SyntheticEvent, useContext } from "react";

type FloatingReturn = ReturnType<typeof useFloatingUI>;

export interface MenuContextValue {
  openState: boolean;
  setOpen: (event: SyntheticEvent, newOpen: boolean) => void;
  floatingStyles: CSSProperties;
  refs: FloatingReturn["refs"];
  submenu: boolean | undefined;
  activeState?: string;
  setActive: (option?: string) => void;
}

export const MenuContext = createContext<MenuContextValue>("MenuContext", {
  openState: false,
  setOpen() {
    return undefined;
  },
  floatingStyles: {},
  refs: {} as FloatingReturn["refs"],
  submenu: undefined,
  activeState: undefined,
  setActive() {
    return undefined;
  },
});

export function useMenuContext() {
  return useContext(MenuContext);
}

export function useIsSubmenu() {
  const context = useMenuContext();
  return context.submenu === true;
}
