import { createContext } from "@salt-ds/core";
import {useContext} from "react";
import {MenuContextValue} from "./MenuContext";

export interface MenuPanelContextValue extends Pick<MenuContextValue, "getItemProps" | "activeIndex"> {

}

export const MenuPanelContext = createContext("MenuPanelContext", {});

export function useMenuPanelContext(){
  return useContext(MenuPanelContext)
}
