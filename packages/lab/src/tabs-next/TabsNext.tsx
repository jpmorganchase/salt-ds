import { makePrefixer, useControlled } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCollection } from "./hooks/useCollection";
import tabsNextCss from "./TabsNext.css";
import {
  type Item,
  type RenderedTab,
  TabsNextContext,
} from "./TabsNextContext";

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
   * Callback fired when the selection changes. The event will be null when
   * selection is moved automatically.
   */
  onChange?: (event: SyntheticEvent | null, value: string) => void;
}

const withBaseName = makePrefixer("saltTabsNext");

export const TabsNext = forwardRef<HTMLDivElement, TabsNextProps>(
  function TabsNext(props, ref) {
    const { className, children, value, defaultValue, onChange, ...rest } =
      props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tabs-next",
      css: tabsNextCss,
      window: targetWindow,
    });

    const [valueToTabIdMap, setValueToIdMap] = useState(
      () => new Map<string, string>(),
    );
    const [valueToPanelIdMap, setValueToPanelIdMap] = useState(
      () => new Map<string, string>(),
    );
    const [renderedTabMap, setRenderedTabMap] = useState(
      () => new Map<string, RenderedTab>(),
    );

    const {
      registerItem,
      updateItem,
      item,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      itemAt,
      getIndex,
      sortItems,
      removalVersion,
      getRemovedItems,
    } = useCollection({ wrap: true });

    const activeTab = useRef<Pick<Item, "id" | "value">>();
    const selectionFromOverflowRef = useRef(false);

    const [menuOpen, setMenuOpen] = useState(false);

    const [selected, setSelectedState] = useControlled({
      controlled: value,
      default: defaultValue,
      name: "TabsNext",
      state: "selected",
    });

    const sortRenderedTabs = useCallback((tabs: RenderedTab[]) => {
      return tabs.toSorted((tabA, tabB) => {
        if (tabA.marker === tabB.marker) {
          return 0;
        }
        if (!tabA.marker || !tabB.marker) {
          return 0;
        }

        const position = tabA.marker.compareDocumentPosition(tabB.marker);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
    }, []);

    const registerRenderedTab = useCallback((tab: RenderedTab) => {
      setRenderedTabMap((map) => {
        const existing = map.get(tab.value);
        if (
          process.env.NODE_ENV !== "production" &&
          existing &&
          existing.id !== tab.id
        ) {
          console.warn(
            `TabsNext received duplicate tab value "${tab.value}". Tab values must be unique within a TabsNext instance.`,
          );
        }

        if (existing === tab) {
          return map;
        }

        const next = new Map(map);
        next.set(tab.value, tab);
        return next;
      });

      return () => {
        setRenderedTabMap((map) => {
          const existing = map.get(tab.value);
          if (!existing || existing.id !== tab.id) {
            return map;
          }

          const next = new Map(map);
          next.delete(tab.value);
          return next;
        });
      };
    }, []);

    const updateRenderedTab = useCallback(
      (value: string, updates: Partial<Omit<RenderedTab, "value">>) => {
        setRenderedTabMap((map) => {
          const existing = map.get(value);
          if (!existing) {
            return map;
          }

          let changed = false;
          const nextRecord = { ...existing };
          for (const [key, nextValue] of Object.entries(updates)) {
            const typedKey = key as keyof Omit<RenderedTab, "value">;
            if (nextRecord[typedKey] !== nextValue) {
              changed = true;
              nextRecord[typedKey] = nextValue as never;
            }
          }

          if (!changed) {
            return map;
          }

          const next = new Map(map);
          next.set(value, nextRecord);
          return next;
        });
      },
      [],
    );

    const getRenderedTab = useCallback(
      (value: string) => {
        return renderedTabMap.get(value);
      },
      [renderedTabMap],
    );

    const renderedTabs = useMemo(() => {
      return sortRenderedTabs(Array.from(renderedTabMap.values()));
    }, [renderedTabMap, sortRenderedTabs]);
    const renderedTabOrderMap = useMemo(() => {
      return new Map(
        renderedTabs.map((tab, index) => [tab.value, index] as const),
      );
    }, [renderedTabs]);
    const getRenderedTabOrder = useCallback(
      (value: string) => {
        return renderedTabOrderMap.get(value) ?? -1;
      },
      [renderedTabOrderMap],
    );

    const setSelected = useCallback(
      (
        event: SyntheticEvent | null,
        value: string,
        source: "main" | "overflow" = "main",
      ) => {
        selectionFromOverflowRef.current = source === "overflow";
        setMenuOpen(false);
        setSelectedState(value);
        onChange?.(event, value);
      },
      [onChange],
    );

    const registerTab = useCallback(
      (tab: Item) => {
        const cleanup = registerItem(tab);
        setValueToIdMap((map) => {
          if (map.get(tab.value) === tab.id) {
            return map;
          }
          const next = new Map(map);
          next.set(tab.value, tab.id);
          return next;
        });

        return () => {
          cleanup();
          setValueToIdMap((map) => {
            if (map.get(tab.value) !== tab.id) {
              return map;
            }
            const next = new Map(map);
            next.delete(tab.value);
            return next;
          });
        };
      },
      [registerItem],
    );

    const registerPanel = useCallback((id: string, value: string) => {
      setValueToPanelIdMap((map) => {
        if (map.get(value) === id) {
          return map;
        }
        const next = new Map(map);
        next.set(value, id);
        return next;
      });
      return () => {
        setValueToPanelIdMap((map) => {
          if (map.get(value) !== id) {
            return map;
          }
          const next = new Map(map);
          next.delete(value);
          return next;
        });
      };
    }, []);

    const getPanelId = useCallback(
      (value: string) => {
        return valueToPanelIdMap.get(value);
      },
      [valueToPanelIdMap],
    );

    const getTabId = useCallback(
      (value: string) => {
        return valueToTabIdMap.get(value);
      },
      [valueToTabIdMap],
    );

    const context = useMemo(
      () => ({
        registerTab,
        updateTab: updateItem,
        registerRenderedTab,
        updateRenderedTab,
        getRenderedTab,
        getRenderedTabOrder,
        renderedTabs,
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
        activeTab,
        selectionFromOverflowRef,
        menuOpen,
        setMenuOpen,
        itemAt,
        getIndex,
        sortItems,
        removalVersion,
        getRemovedItems,
      }),
      [
        registerPanel,
        registerTab,
        updateItem,
        registerRenderedTab,
        updateRenderedTab,
        getRenderedTab,
        getRenderedTabOrder,
        renderedTabs,
        getPanelId,
        getTabId,
        selected,
        setSelected,
        item,
        getNext,
        getPrevious,
        getFirst,
        getLast,
        menuOpen,
        itemAt,
        getIndex,
        sortItems,
        removalVersion,
        getRemovedItems,
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
