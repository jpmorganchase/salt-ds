import {
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { useControlled } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { TabsNextContext } from "./TabsNextContext";

export interface TabsNextProps {
  /* Value for the controlled version. */
  value?: string;
  /* Callback for the controlled version. */
  onChange?: (event: SyntheticEvent, value: string) => void;
  /* Initial value for the uncontrolled version. */
  defaultValue?: string;

  children: ReactNode;
}

export function TabsNext({
  children,
  value,
  defaultValue,
  onChange,
}: TabsNextProps) {
  const valueToTabIdMap = useRef<Map<string, string>>(new Map());
  const valueToPanelIdMap = useRef<Map<string, string>>(new Map());
  const [_, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  const [selected, setSelectedState] = useControlled({
    controlled: value,
    default: defaultValue,
    name: "TabListNext",
    state: "selected",
  });
  const [active, setActive] = useState<string | undefined>(selected);

  const setSelected = useCallback(
    (event: SyntheticEvent, action: string) => {
      setSelectedState(action);
      setActive(action);

      // setTimeout(() => {
      //   const itemElement = item(action)?.element;
      //   itemElement?.focus({ preventScroll: true });
      //   itemElement?.scrollIntoView({ block: "nearest", inline: "nearest" });
      // }, 0);

      onChange?.(event, action);
    },
    [onChange],
  );

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

  const context = useMemo(
    () => ({
      registerTab,
      registerPanel,
      getPanelId,
      getTabId,
      selected,
      setSelected,
      active,
      setActive,
    }),
    [
      registerPanel,
      registerTab,
      getPanelId,
      getTabId,
      selected,
      active,
      setActive,
    ],
  );

  return (
    <TabsNextContext.Provider value={context}>
      {children}
    </TabsNextContext.Provider>
  );
}
