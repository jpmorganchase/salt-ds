import { useControlled, useIdMemo } from "@salt-ds/core";
import { ReactNode, useCallback } from "react";
import { TabDescriptor } from "./TabsTypes";
import { useItemsWithIds } from "./useItemsWithIds";

export interface TabsHookProps {
  activeTabIndex?: number | null;
  children: ReactNode;
  defaultActiveTabIndex?: number;
  id?: string;
  onActiveChange?: (tabIndex: number) => void;
}

export interface TabsHookResult {
  activeTabIndex?: number | null;
  id: string;
  onActiveChange?: (tabIndex: number) => void;
  tabPanel?: ReactNode;
  tabs: TabDescriptor[];
}

export const useTabs = ({
  activeTabIndex: activeTabIndexProp,
  children,
  defaultActiveTabIndex,
  id: idProp,
  onActiveChange,
}: TabsHookProps): TabsHookResult => {
  const id = useIdMemo(idProp);
  const [itemsWithIds] = useItemsWithIds(children, id);

  const [activeTabIndex, setActiveTabIndex] = useControlled({
    controlled: activeTabIndexProp,
    default: defaultActiveTabIndex ?? 0,
    name: "useTabs",
    state: "activeTabIndex",
  });

  const handleTabActivated = useCallback(
    (tabIndex: number) => {
      setActiveTabIndex(tabIndex);
      onActiveChange?.(tabIndex);
    },
    [onActiveChange, setActiveTabIndex]
  );

  return {
    id,
    onActiveChange: handleTabActivated,
    activeTabIndex,
    tabs: itemsWithIds,
    tabPanel:
      activeTabIndex === null
        ? null
        : itemsWithIds[activeTabIndex]?.element ?? null,
  };
};
