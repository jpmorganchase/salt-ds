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

          if (activeTab.current?.value !== value) {
            return;
          }

          const containFocus = () => {
            const activeIndex = items.current.findIndex(
              (item) => value === item.value,
            );

            const nextIndex =
              activeIndex === items.current.length - 1
                ? items.current.length - 2
                : activeIndex + 1;

            const nextActive = items.current[nextIndex];
            setSelectedState((old) => {
              if (old === value) {
                return nextActive.value;
              }
              return old;
            });

            nextActive?.element?.focus();
          };

          if (document.activeElement === document.body) {
            requestAnimationFrame(() => {
              if (document.activeElement === document.body) {
                containFocus();
              }
            });
          } else {
            const handleFocusOut = (event: FocusEvent) => {
              if (!event.relatedTarget) {
                requestAnimationFrame(() => {
                  if (document.activeElement === document.body) {
                    containFocus();
                  }
                });
              }
            };

            element.ownerDocument.addEventListener("focusout", handleFocusOut, {
              once: true,
            });

            setTimeout(() => {
              element.ownerDocument.removeEventListener(
                "focusout",
                handleFocusOut,
              );
            }, 1000);
          }
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
