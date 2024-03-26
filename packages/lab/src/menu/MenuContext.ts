import { createContext, UseFloatingUIReturn } from "@salt-ds/core";
import {MutableRefObject, useContext} from "react";
import { useInteractions } from "@floating-ui/react";

type UseInteractionsReturn = ReturnType<typeof useInteractions>;

export interface MenuContextValue
  extends Pick<
      UseInteractionsReturn,
      "getItemProps" | "getReferenceProps" | "getFloatingProps"
    >,
    Partial<Pick<UseFloatingUIReturn, "context" | "refs">> {
  openState: boolean;
  activeIndex: number | null;
  getPanelPosition: () => Record<string, unknown>;
  elementsRef: MutableRefObject<(HTMLDivElement | null)[]>;
}

export const MenuContext = createContext<MenuContextValue>("MenuContext", {
  openState: false,
  getReferenceProps: () => ({}),
  getFloatingProps: () => ({}),
  getPanelPosition: () => ({}),
  getItemProps: () => ({}),
  activeIndex: null,
  elementsRef: { current: [] },
});

export function useMenuContext() {
  return useContext(MenuContext);
}
