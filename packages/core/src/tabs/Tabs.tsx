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
import { makePrefixer, useControlled } from "../utils";
import { type Item, TabsContext } from "./internal/contexts/TabsContext";
import { useOverflowSelectionState } from "./internal/overflow/useOverflowSelectionState";
import { useCollection } from "./internal/registry/useCollection";
import { useRenderedTabsRegistry } from "./internal/registry/useRenderedTabsRegistry";
import tabsCss from "./Tabs.css";

export interface TabsProps
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
   * Callback fired when the selection changes.
   * The event will be null when selection is moved automatically, such as when
   * the currently selected tab is removed and the next available tab is
   * selected.
   */
  onChange?: (event: SyntheticEvent | null, value: string) => void;
}

const withBaseName = makePrefixer("saltTabs");

function setValueIdMapEntry(
  map: Map<string, string>,
  value: string,
  id: string,
) {
  if (map.get(value) === id) {
    return map;
  }

  const next = new Map(map);
  next.set(value, id);
  return next;
}

function removeValueIdMapEntry(
  map: Map<string, string>,
  value: string,
  id: string,
) {
  if (map.get(value) !== id) {
    return map;
  }

  const next = new Map(map);
  next.delete(value);
  return next;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs(props, ref) {
    const { className, children, value, defaultValue, onChange, ...rest } =
      props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tabs",
      css: tabsCss,
      window: targetWindow,
    });

    const [valueToTabIdMap, setValueToIdMap] = useState(
      () => new Map<string, string>(),
    );
    const [valueToPanelIdMap, setValueToPanelIdMap] = useState(
      () => new Map<string, string>(),
    );
    const {
      renderMode,
      registerBootstrapTab,
      setBootstrapTabReady,
      setBootstrapOverflowReady,
      registerRenderedTab,
      updateRenderedTab,
      getRenderedTab,
      getRenderedTabOrder,
      renderedTabs,
    } = useRenderedTabsRegistry();

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
    } = useCollection({ targetWindow, wrap: true });

    const activeTab = useRef<Pick<Item, "id" | "value">>();

    const [menuOpen, setMenuOpen] = useState(false);

    const [selected, setSelectedState] = useControlled({
      controlled: value,
      default: defaultValue,
      name: "Tabs",
      state: "selected",
    });

    const commitSelection = useCallback(
      (event: SyntheticEvent | null, newValue: string) => {
        setSelectedState(newValue);
        if (selected !== newValue) {
          onChange?.(event, newValue);
        }
      },
      [onChange, selected],
    );
    const { selectionFromOverflowValueRef, setSelected } =
      useOverflowSelectionState({
        commitSelection,
        menuOpen,
        selected,
        setMenuOpen,
      });

    const registerTab = useCallback(
      (tab: Item) => {
        const cleanup = registerItem(tab);
        setValueToIdMap((map) => setValueIdMapEntry(map, tab.value, tab.id));

        return () => {
          cleanup();
          setValueToIdMap((map) =>
            removeValueIdMapEntry(map, tab.value, tab.id),
          );
        };
      },
      [registerItem],
    );

    const registerPanel = useCallback((id: string, value: string) => {
      setValueToPanelIdMap((map) => setValueIdMapEntry(map, value, id));
      return () => {
        setValueToPanelIdMap((map) => removeValueIdMapEntry(map, value, id));
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
        renderMode,
        registerBootstrapTab,
        setBootstrapTabReady,
        setBootstrapOverflowReady,
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
        selectionFromOverflowValueRef,
        menuOpen,
        setMenuOpen,
        itemAt,
        getIndex,
        sortItems,
        removalVersion,
        getRemovedItems,
      }),
      [
        renderMode,
        registerBootstrapTab,
        setBootstrapTabReady,
        setBootstrapOverflowReady,
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
        selectionFromOverflowValueRef,
      ],
    );

    return (
      <TabsContext.Provider value={context}>
        <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
