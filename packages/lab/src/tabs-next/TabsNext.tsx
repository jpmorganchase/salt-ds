import { makePrefixer, useControlled, useEventCallback } from "@salt-ds/core";
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
import { type Item, TabsNextContext } from "./TabsNextContext";

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

    const [valueToTabIdMap, setValueToIdMap] = useState(
      () => new Map<string, string>(),
    );
    const [valueToPanelIdMap, setValueToPanelIdMap] = useState(
      () => new Map<string, string>(),
    );

    const {
      registerItem,
      item,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      itemAt,
      getIndex,
      sortItems,
      getRemovedItems,
    } = useCollection({ wrap: true });

    const activeTab = useRef<Pick<Item, "id" | "value">>();

    const [menuOpen, setMenuOpen] = useState(false);

    const [selected, setSelectedState] = useControlled({
      controlled: value,
      default: defaultValue,
      name: "TabListNext",
      state: "selected",
    });

    const setSelected = useCallback(
      (event: SyntheticEvent | null, value: string) => {
        setMenuOpen(false);
        setSelectedState(value);
        onChange?.(event, value);
      },
      [onChange],
    );

    const registerTab = useEventCallback((tab: Item) => {
      const cleanup = registerItem(tab);
      setValueToIdMap((map) => {
        const next = new Map(map);
        next.set(tab.value, tab.id);
        return next;
      });

      return () => {
        cleanup();
        setValueToIdMap((map) => {
          const next = new Map(map);
          next.delete(tab.value);
          return next;
        });
      };
    });

    const registerPanel = useCallback((id: string, value: string) => {
      setValueToPanelIdMap((map) => {
        const next = new Map(map);
        next.set(value, id);
        return next;
      });
      return () => {
        setValueToPanelIdMap((map) => {
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
        menuOpen,
        setMenuOpen,
        itemAt,
        getIndex,
        sortItems,
        getRemovedItems,
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
        menuOpen,
        itemAt,
        getIndex,
        sortItems,
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
