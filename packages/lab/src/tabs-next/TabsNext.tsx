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

    const [valueToTabIdMap, setValueToIdMap] = useState({
      map: new Map<string, string>(),
    });
    const [valueToPanelIdMap, setValueToPanelIdMap] = useState({
      map: new Map<string, string>(),
    });

    const {
      registerItem,
      item,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      items,
    } = useCollection({ wrap: true });

    const activeTab = useRef<Pick<Item, "id" | "value">>();

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

    const registerTab = useCallback(
      ({ id, value, element }: Item) => {
        setValueToIdMap(({ map }) => {
          map.set(value, id);
          return { map };
        });

        // If tab was previously focused, re-focus.
        if (activeTab.current?.value === value) {
          element.focus();
        }

        const cleanup = registerItem({ id, element, value });
        return () => {
          const items = cleanup();
          setValueToIdMap(({ map }) => {
            map.delete(value);
            return { map };
          });

          requestAnimationFrame(() => {
            if (
              document.activeElement === document.body &&
              activeTab.current?.value === value
            ) {
              const activeIndex = items.current.findIndex(
                (item) => value === item.value,
              );
              const nextActive =
                items.current[
                  Math.min(activeIndex + 1, items.current.length - 1)
                ];
              setSelectedState((old) => {
                if (old === value) {
                  return nextActive.value;
                }
                return old;
              });
              nextActive?.element?.focus();
            }
          });
        };
      },
      [registerItem],
    );

    const registerPanel = useCallback((id: string, value: string) => {
      setValueToPanelIdMap(({ map }) => {
        map.set(value, id);
        return { map };
      });
      return () => {
        setValueToIdMap(({ map }) => {
          map.delete(value);
          return { map };
        });
      };
    }, []);

    const getPanelId = useCallback(
      (value: string) => {
        return valueToPanelIdMap.map.get(value);
      },
      [valueToPanelIdMap],
    );

    const getTabId = useCallback(
      (value: string) => {
        return valueToTabIdMap.map.get(value);
      },
      [valueToTabIdMap],
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
        activeTab,
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
