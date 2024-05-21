import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { makePrefixer, useControlled } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type Item, TabsNextContext } from "./TabsNextContext";
import { useCollection } from "./hooks/useCollection";

export interface TabsNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  children?: ReactNode;
  /* Value for the controlled version. */
  value?: string;
  /* Callback for the controlled version. */
  onChange?: (event: SyntheticEvent, value: string) => void;
  /* Initial value for the uncontrolled version. */
  defaultValue?: string;
}

const withBaseName = makePrefixer("saltTabsNext");

export const TabsNext = forwardRef<HTMLDivElement, TabsNextProps>(
  function TabsNext(props, ref) {
    const { className, children, value, defaultValue, onChange, ...rest } =
      props;

    const valueToTabIdMap = useRef<Map<string, string>>(new Map());
    const valueToPanelIdMap = useRef<Map<string, string>>(new Map());
    const [_, updateState] = useState({});
    const forceUpdate = useCallback(() => updateState({}), []);

    const {
      registerItem,
      item,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      items,
    } = useCollection({ wrap: true });

    const [selected, setSelectedState] = useControlled({
      controlled: value,
      default: defaultValue,
      name: "TabListNext",
      state: "selected",
    });

    const setSelected = useCallback(
      (event: SyntheticEvent, action: string) => {
        const newItem = item(action);

        if (!newItem) return;

        setSelectedState(newItem.value);
        onChange?.(event, newItem.value);
      },
      [onChange, item],
    );

    const timeoutRef = useRef<undefined | number>(undefined);
    const targetWindow = useWindow();

    const triggerUpdate = useCallback(() => {
      timeoutRef.current = targetWindow?.setTimeout(() => {
        forceUpdate();
      }, 100);
    }, [targetWindow, forceUpdate]);

    const registerTab = useCallback(
      ({ id, value, element }: Item) => {
        valueToTabIdMap.current.set(value, id);
        const cleanup = registerItem({ id, element, value });
        triggerUpdate();
        return () => {
          cleanup();
          valueToTabIdMap.current.delete(value);
        };
      },
      [triggerUpdate, registerItem],
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
        item,
        getNext,
        getPrevious,
        getFirst,
        getLast,
        items,
      }),
      [
        registerPanel,
        registerTab,
        getPanelId,
        getTabId,
        selected,
        setSelected,
        item,
        getNext,
        getPrevious,
        getFirst,
        getLast,
        items,
      ],
    );

    return (
      <TabsNextContext.Provider value={context}>
        <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
          {children}
        </div>
      </TabsNextContext.Provider>
    );
  },
);
