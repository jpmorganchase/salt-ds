import { createContext } from "@salt-ds/core";
import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  type SyntheticEvent,
  useContext,
} from "react";
import type { useCollection } from "./hooks/useCollection";

export interface Item {
  id: string;
  value: string;
  element: HTMLElement;
}

export interface TabsNextContextValue
  extends Omit<ReturnType<typeof useCollection>, "registerItem"> {
  registerTab: (item: Item) => () => void;
  registerPanel: (id: string, value: string) => () => void;
  getPanelId: (value: string) => string | undefined;
  getTabId: (value: string) => string | undefined;
  selected?: string;
  setSelected: (event: SyntheticEvent, value: string) => void;
  activeTab: MutableRefObject<Pick<Item, "id" | "value"> | undefined>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const TabsNextContext = createContext<TabsNextContextValue>(
  "TabsNextContext",
  {
    getFirst: () => null,
    getLast: () => null,
    getNext: () => null,
    getPrevious: () => null,
    item: () => null,
    getIndex: () => -1,
    itemAt: () => null,
    sortItems: () => undefined,
    selected: undefined,
    registerTab: () => () => undefined,
    registerPanel: () => () => undefined,
    getPanelId: () => undefined,
    getTabId: () => undefined,
    setSelected: () => undefined,
    activeTab: { current: undefined },
    menuOpen: false,
    setMenuOpen: () => undefined,
  },
);

export function useTabsNext() {
  return useContext(TabsNextContext);
}
