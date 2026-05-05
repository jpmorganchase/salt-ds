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
  element: HTMLElement | null;
  location?: "hidden" | "main" | "overflow";
  order?: number;
}

export interface RenderedTab {
  host: HTMLDivElement;
  id: string;
  marker: HTMLElement | null;
  root: HTMLElement | null;
  trigger: HTMLButtonElement | null;
  value: string;
  width: number;
}

export type TabsNextRenderMode = "inline" | "portal";

export interface TabsNextContextValue
  extends Omit<
    ReturnType<typeof useCollection>,
    "registerItem" | "updateItem"
  > {
  renderMode: TabsNextRenderMode;
  registerBootstrapTab: (value: string) => () => void;
  setBootstrapTabReady: (value: string, ready: boolean) => void;
  setBootstrapOverflowReady: (ready: boolean) => void;
  registerTab: (item: Item) => () => void;
  updateTab: (id: string, updates: Partial<Omit<Item, "id" | "value">>) => void;
  registerRenderedTab: (tab: RenderedTab) => () => void;
  updateRenderedTab: (
    value: string,
    updates: Partial<Omit<RenderedTab, "value">>,
  ) => void;
  getRenderedTab: (value: string) => RenderedTab | undefined;
  getRenderedTabOrder: (value: string) => number;
  renderedTabs: RenderedTab[];
  registerPanel: (id: string, value: string) => () => void;
  getPanelId: (value: string) => string | undefined;
  getTabId: (value: string) => string | undefined;
  selected?: string;
  setSelected: (
    event: SyntheticEvent | null,
    value: string,
    source?: "main" | "overflow",
  ) => void;
  activeTab: MutableRefObject<Pick<Item, "id" | "value"> | undefined>;
  selectionFromOverflowValueRef: MutableRefObject<string | null>;
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
    renderMode: "inline",
    registerBootstrapTab: () => () => undefined,
    setBootstrapTabReady: () => undefined,
    setBootstrapOverflowReady: () => undefined,
    selected: undefined,
    registerTab: () => () => undefined,
    updateTab: () => undefined,
    registerRenderedTab: () => () => undefined,
    updateRenderedTab: () => undefined,
    getRenderedTab: () => undefined,
    getRenderedTabOrder: () => -1,
    renderedTabs: [],
    registerPanel: () => () => undefined,
    getPanelId: () => undefined,
    getTabId: () => undefined,
    setSelected: () => undefined,
    activeTab: { current: undefined },
    selectionFromOverflowValueRef: { current: null },
    menuOpen: false,
    setMenuOpen: () => undefined,
    removalVersion: 0,
    getRemovedItems: () => new Map(),
  },
);

export function useTabsNext() {
  return useContext(TabsNextContext);
}
