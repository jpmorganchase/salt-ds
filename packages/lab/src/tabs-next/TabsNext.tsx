import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";

import { useWindow } from "@salt-ds/window";
import { TabsNextContext } from "./TabsNextContext";

export interface TabsNextProps {
  children: ReactNode;
}

export function TabsNext({ children }: TabsNextProps) {
  const valueToTabIdMap = useRef<Map<string, string>>(new Map());
  const valueToPanelIdMap = useRef<Map<string, string>>(new Map());
  const [_, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
  const [selectedTab, setSelectedTab] = useState<string | undefined>(undefined);

  const timeoutRef = useRef<undefined | number>(undefined);
  const targetWindow = useWindow();

  const triggerUpdate = useCallback(() => {
    timeoutRef.current = targetWindow?.setTimeout(() => {
      forceUpdate();
    }, 100);
  }, [targetWindow, forceUpdate]);

  const registerTab = useCallback(
    (id: string, value: string) => {
      valueToTabIdMap.current.set(value, id);
      triggerUpdate();
      return () => {
        valueToTabIdMap.current.delete(value);
      };
    },
    [triggerUpdate],
  );

  const registerPanel = useCallback(
    (id: string, value: string) => {
      valueToPanelIdMap.current.set(value, id);
      triggerUpdate();
      return () => {
        valueToPanelIdMap.current.delete(value);
      };
    },
    [triggerUpdate],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: needed to trigger an update
  const getPanelId = useCallback(
    (value: string) => {
      return valueToPanelIdMap.current.get(value);
    },
    [_],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: needed to trigger an update
  const getTabId = useCallback(
    (value: string) => {
      return valueToTabIdMap.current.get(value);
    },
    [_],
  );

  const value = useMemo(
    () => ({
      registerTab,
      registerPanel,
      getPanelId,
      getTabId,
      selectedTab,
      setSelectedTab,
    }),
    [registerPanel, registerTab, getPanelId, getTabId, selectedTab],
  );

  return (
    <TabsNextContext.Provider value={value}>
      {children}
    </TabsNextContext.Provider>
  );
}
