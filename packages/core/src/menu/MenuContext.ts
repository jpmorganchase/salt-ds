import type { useInteractions } from "@floating-ui/react";
import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useContext,
} from "react";
import { createContext, type UseFloatingUIReturn } from "../utils";

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
  focusInside: boolean;
  setFocusInside: Dispatch<SetStateAction<boolean>>;
  isNested: boolean;
}

export const MenuContext = createContext<MenuContextValue>("MenuContext", {
  openState: false,
  getReferenceProps: () => ({}),
  getFloatingProps: () => ({}),
  getPanelPosition: () => ({}),
  getItemProps: () => ({}),
  activeIndex: null,
  elementsRef: { current: [] },
  focusInside: false,
  setFocusInside: () => undefined,
  isNested: false,
});

export function useMenuContext() {
  return useContext(MenuContext);
}
