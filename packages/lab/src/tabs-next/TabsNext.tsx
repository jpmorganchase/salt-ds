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

import {
  makePrefixer,
  useControlled,
  useEventCallback,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { type Item, TabsNextContext } from "./TabsNextContext";
import { useCollection } from "./hooks/useCollection";

export interface TabsNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  children?: ReactNode;
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: string;
  /**
   * The value. Use when the component is controlled.
   */
  value?: string;
  /**
   * Callback fired when the selection changes. The event will be null when selection is moved automatically.
   */
  onChange?: (event: SyntheticEvent | null, value: string) => void;
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
    const returnFocus = useRef<string | undefined>(undefined);

    const [menuOpen, setMenuOpen] = useState(false);

    const [selected, setSelectedState] = useControlled({
      controlled: value,
      default: defaultValue,
      name: "TabListNext",
      state: "selected",
    });

    // This ref is needed so we can read the current selected item in the containFocus() function.
    const selectedRef = useRef<string | undefined>(undefined);
    useIsomorphicLayoutEffect(() => {
      selectedRef.current = selected;
    }, [selected]);

    const setSelected = useCallback(
      (event: SyntheticEvent | null, value: string) => {
        setMenuOpen(false);
        setSelectedState(value);
        onChange?.(event, value);
      },
      [onChange],
    );

    const registerTab = useEventCallback((item: Item) => {
      const cleanup = registerItem(item);
      setValueToIdMap(({ map }) => {
        map.set(item.value, item.id);
        return { map };
      });

      return () => {
        const items = cleanup();
        setValueToIdMap(({ map }) => {
          map.delete(item.value);
          return { map };
        });

        if (activeTab.current?.value !== item.value) {
          return;
        }

        returnFocus.current = item.value;

        const containFocus = () => {
          const activeIndex = items.current.findIndex(
            (i) => item.value === i.value,
          );

          const nextIndex =
            activeIndex === items.current.length - 1
              ? items.current.length - 2
              : activeIndex + 1;

          const nextActive = items.current[nextIndex];

          returnFocus.current = nextActive.value;

          if (selectedRef.current === item.value) {
            setSelected(null, nextActive.value);
          }

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

          item.element.ownerDocument.addEventListener(
            "focusout",
            handleFocusOut,
            {
              once: true,
            },
          );

          setTimeout(() => {
            item.element.ownerDocument.removeEventListener(
              "focusout",
              handleFocusOut,
            );
          }, 1000);
        }
      };
    });

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
        menuOpen,
        setMenuOpen,
        returnFocus,
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
        menuOpen,
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
