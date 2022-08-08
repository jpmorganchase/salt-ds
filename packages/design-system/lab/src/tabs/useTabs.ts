import { useControlled, useIdMemo } from "@jpmorganchase/uitk-core";
import { ReactNode, useCallback } from "react";
import { TabDescriptor } from "./TabsTypes";
import { useItemsWithIds } from "./useItemsWithIds";

export interface TabsHookProps {
  activeTabIndex?: number;
  children: ReactNode;
  defaultActiveTabIndex?: number;
  id?: string;
  onActiveChange?: (tabIndex: number) => void;
}

export interface TabsHookResult {
  activeTabIndex?: number;
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
    default:
      defaultActiveTabIndex ??
      (activeTabIndexProp === undefined ? 0 : undefined),
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

  const contentItem = itemsWithIds[activeTabIndex];

  return {
    id,
    onActiveChange: handleTabActivated,
    activeTabIndex,
    tabs: itemsWithIds,
    tabPanel: contentItem?.element ?? null,
  };
};
