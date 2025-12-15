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
      itemAt,
      getIndex,
      sortItems,
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

    const registerTab = useEventCallback((item: Item) => {
      const cleanup = registerItem(item);
      setValueToIdMap(({ map }) => {
        map.set(item.value, item.id);
        return { map };
      });

      return () => {
        cleanup();
        setValueToIdMap(({ map }) => {
          map.delete(item.value);
          return { map };
        });
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
        activeTab,
        menuOpen,
        setMenuOpen,
        itemAt,
        getIndex,
        sortItems,
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
