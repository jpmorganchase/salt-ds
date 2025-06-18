import {
  Button,
  makePrefixer,
  Tooltip,
  useIcon,
  useIdMemo,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  cloneElement,
  createElement,
  type ForwardedRef,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { SelectionChangeHandler } from "../common-hooks";
import { Dropdown } from "../dropdown";
import {
  type InjectedSourceItem,
  type OverflowItem,
  useOverflowLayout,
} from "../responsive";
import { useOverflowCollectionItems } from "../responsive/useOverflowCollectionItems";
import { Tab } from "./Tab";
import { TabActivationIndicator } from "./TabActivationIndicator";
import type {
  FocusAPI,
  responsiveDataAttributes,
  TabDescriptor,
  TabElement,
  TabProps,
  TabsSource,
  TabstripProps,
} from "./TabsTypes";
import tabstripCss from "./Tabstrip.css";
import themeTabstripCss from "./ThemeTabstrip.css";
import { useTabstrip } from "./useTabstrip";

const withBaseName = makePrefixer("saltTabstrip");

const ADD_TAB_LABEL = "Create Tab";

// Simple strings for tab labels are accepted as input, convert to TabDescriptors internally
const tabDescriptors = (
  tabs: TabsSource | undefined,
): TabDescriptor[] | undefined =>
  tabs?.map((tab: string | TabDescriptor) =>
    typeof tab === "string" ? { label: tab } : tab,
  );

export const Tabstrip = forwardRef(function Tabstrip(
  {
    activeTabIndex: activeTabIndexProp,
    allowDragDrop = false,
    centered = false,
    children,
    className: classNameProp,
    defaultSource,
    defaultActiveTabIndex,
    editing,
    variant,
    enableAddTab = false,
    enableCloseTab,
    enableRenameTab,
    id: idProp,
    keyBoardActivation = "manual",
    onAddTab,
    onActiveChange,
    onCloseTab,
    onEnterEditMode,
    onExitEditMode,
    onMouseDown,
    onMoveTab,
    orientation = "horizontal",
    overflowMenu: overflowMenuProp = true,
    promptForNewTabName = true,
    showActivationIndicator = true,
    source,
    title,
    ...htmlAttributes
  }: TabstripProps,
  forwardedRef: ForwardedRef<FocusAPI>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab-strip",
    css: tabstripCss,
    window: targetWindow,
  });
  useComponentCssInjection({
    testId: "salt-theme-tab-strip",
    css: themeTabstripCss,
    window: targetWindow,
  });

  const root = useRef<HTMLDivElement>(null);
  // can't use forwardedRef here, can we ?
  // const setForkRef = useForkRef(root, forwardedRef);
  const activeRef = useRef<number | null>(
    activeTabIndexProp || defaultActiveTabIndex || 0,
  );
  const { OverflowIcon } = useIcon();
  const overflowItemsRef = useRef<OverflowItem[]>([]);
  const [showOverflowMenu, _setShowOverflowMenu] = useState(false);

  const setShowOverflowMenu = useCallback((value: boolean) => {
    _setShowOverflowMenu(value);
  }, []);

  const tabstripId = useIdMemo(idProp);

  const injectedItems = enableAddTab
    ? [
        {
          source: { label: "Add Tab", position: -1, priority: 1 },
        } as InjectedSourceItem,
      ]
    : undefined;

  const collectionHook = useOverflowCollectionItems({
    children,
    defaultSource: tabDescriptors(defaultSource),
    id: tabstripId,
    injectedItems,
    label: "Tabstrip",
    orientation,
    source: tabDescriptors(source),
    options: {
      closeable: enableCloseTab,
      editable: enableRenameTab,
      getPriority: (item, index) => {
        return index === activeRef.current ? 1 : undefined;
      },
    },
  });

  const childCount = useRef(Children.count(children));

  const getChildren = (): TabElement[] | undefined => {
    if (Children.count(children) === 0) {
      return undefined;
    }
    return Children.toArray(children) as TabElement[];
  };

  const [innerContainerRef, switchOverflowPriorities] = useOverflowLayout({
    collectionHook,
    disableOverflow: overflowMenuProp === false,
    id: tabstripId,
    orientation,
    label: "Tabstrip",
  });
  overflowItemsRef.current = collectionHook.data;
  const overflowedItems = collectionHook.data.filter((item) => item.overflowed);

  const tabMovedHandler = useCallback(
    (fromIndex: number, toIndex: number) => {
      onMoveTab?.(fromIndex, toIndex);
      setTimeout(() => {
        collectionHook.dispatch({
          type: "reset",
        });
      }, 50);
    },
    [collectionHook, onMoveTab],
  );

  const handleTabSelectionChange = useCallback(
    (tabIndex: number) => {
      const selectedItem = collectionHook.data[tabIndex];
      const prevSelectedItem = collectionHook.data.find(
        (item) => item.priority === 1 && !item.isOverflowIndicator,
      );
      if (selectedItem && prevSelectedItem && overflowMenuProp) {
        switchOverflowPriorities(selectedItem, prevSelectedItem);
      }
      onActiveChange?.(tabIndex);
      setShowOverflowMenu(false);
    },
    [
      collectionHook.data,
      onActiveChange,
      overflowMenuProp,
      setShowOverflowMenu,
      switchOverflowPriorities,
    ],
  );

  const {
    activeTabIndex,
    activateTab,
    addTab,
    onMouseDown: tabstripHookMouseDown,
    ...tabstripHook
  } = useTabstrip({
    activeTabIndex: activeTabIndexProp,
    allowDragDrop,
    collectionHook,
    defaultTabs: tabDescriptors(defaultSource),
    defaultActiveTabIndex,
    editing,
    enableAddTab,
    idRoot: tabstripId,
    innerContainerRef,
    keyBoardActivation,
    onActiveChange: handleTabSelectionChange,
    onCloseTab,
    onEnterEditMode,
    onExitEditMode,
    onMoveTab: tabMovedHandler,
    orientation,
    promptForNewTabName,
    tabs: tabDescriptors(source) ?? getChildren(),
  });

  activeRef.current = activeTabIndex;

  useImperativeHandle(
    forwardedRef,
    () =>
      ({
        focus: () => {
          const { current: tabstrip } = root;
          if (tabstrip) {
            const selectedTab = tabstrip.querySelector(
              '.saltTab[aria-selected="true"]',
            ) as HTMLElement;
            if (selectedTab) {
              selectedTab.focus();
            }
          }
        },
      }) as FocusAPI,
    [],
  );

  const handleAddTabClick = useCallback(() => {
    if (!collectionHook.isControlled) {
      addTab();
    }
    onAddTab?.();
  }, [collectionHook.isControlled, onAddTab, addTab]);

  const selectedIndex = useRef(activeTabIndex);
  const focusedTabIndex = tabstripHook.highlightedIdx;
  const handleOverflowSelectionChange: SelectionChangeHandler<OverflowItem> =
    useCallback(
      (e, tab) => {
        if (tab !== null) {
          activateTab(tab.index);
        }
      },
      [activateTab],
    );

  const handleKeydownOverflowMenu = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      tabstripHook.navigationProps?.onKeyDown?.(e);
    },
    [tabstripHook.navigationProps],
  );

  const handleOverflowMenuOpen = useCallback(
    (open: boolean) => {
      setShowOverflowMenu(open);
    },
    [setShowOverflowMenu],
  );

  const handleMouseDown = useCallback(
    (evt: MouseEvent<HTMLDivElement>) => {
      onMouseDown?.(evt);
      tabstripHookMouseDown?.(evt);
    },
    [onMouseDown, tabstripHookMouseDown],
  );

  // shouldn't we use ref for this ?
  useIsomorphicLayoutEffect(() => {
    // We don't care about changes to overflowedItems here, the overflowObserver
    // always does the right thing. We only care about changes to selected tab
    if (selectedIndex.current !== activeTabIndex && overflowMenuProp) {
      // We might want to do this only if the selected tab is overflowed ?
      // TODO
      // resetOverflow();
      selectedIndex.current = activeTabIndex;
    }
  }, [overflowMenuProp, activeTabIndex]);

  useIsomorphicLayoutEffect(() => {
    if (Children.count(children) !== childCount.current) {
      childCount.current = Children.count(children);
      // TODO
      // resetOverflow();
    }
  }, [children]);

  /*
   * biome-ignore lint/correctness/useExhaustiveDependencies: We only want the effect to run when value changes, not every time focusedTabIndex changes.
   * It doesn't matter if focusedTabIndex is stale in between calls - it will be correct when value changes.
   */
  useIsomorphicLayoutEffect(() => {
    if (
      activeTabIndex !== null &&
      focusedTabIndex !== activeTabIndex &&
      focusedTabIndex !== -1
    ) {
      tabstripHook.focusTab(activeTabIndex);
    }
  }, [activeTabIndex]);

  const renderContent = () => {
    const content = collectionHook.data
      .filter((item) => !item.isOverflowIndicator && !item.isInjectedItem)
      .map((item: OverflowItem, index: number) => {
        // TODO sort out typoing
        const tab = item.source as unknown as TabDescriptor;
        const element = item.element as TabElement;

        const selected = index === activeTabIndex;
        const focusVisible = tabstripHook.focusVisible === index;
        const overflowed =
          overflowedItems.findIndex(
            (item: OverflowItem) => item.index === index,
          ) !== -1;

        const tabIsBeingEdited = tabstripHook.editing && selected;
        const tabIndex = tabIsBeingEdited
          ? undefined
          : selected && !tabstripHook.focusIsWithinComponent
            ? 0
            : -1;

        const baseProps: Partial<TabProps> &
          responsiveDataAttributes & {
            ref?: RefObject<HTMLDivElement>;
            key: string | number;
          } = {
          "data-index": index,
          "data-priority": item.priority,
          "data-overflowed": overflowed ? true : undefined,
          ...tabstripHook.navigationProps,
          id: item.id,
          key: index,
          onMouseDown: handleMouseDown,
          tabIndex,
        };

        const tabProps = {
          ...tabstripHook.tabProps,
          closeable: item.closeable,
          dragging: tabstripHook.draggedItemIndex === index,
          editable: item.editable,
          editing: tabIsBeingEdited,
          focusVisible,
          index,
          onClose: item.closeable ? tabstripHook.closeTab : undefined,
          orientation,
          selected,
        } as Partial<TabProps>;

        if (isValidElement(element)) {
          if (element.type === Tab) {
            return cloneElement(element, { ...baseProps, ...tabProps });
          }
          return cloneElement(element, baseProps);
        }

        return createElement(Tab, {
          ...baseProps,
          ...tabProps,
          label: tab.label,
        });
      });

    const overflowCount = overflowedItems.length;
    const draggingActiveTab = tabstripHook.draggedItemIndex === activeTabIndex;
    const showOverflow =
      (tabstripHook.revealOverflowedItems && !draggingActiveTab) ||
      showOverflowMenu;
    const showTooltip = tabstripHook.revealOverflowedItems && draggingActiveTab;
    const overflowIndicator = collectionHook.data.find(
      (i) => i.isOverflowIndicator,
    );
    const [injectedItem] = collectionHook.data.filter((i) => i.isInjectedItem);

    if (overflowIndicator) {
      content.push(
        <Tooltip
          content="Active Tab cannot be moved into overflow list"
          open
          disabled={!showTooltip}
          status="warning"
          key="tooltip"
          hideArrow
        >
          <Dropdown<OverflowItem>
            className={clsx(withBaseName("overflowMenu"), {
              [withBaseName("overflowMenu-open")]: showOverflow,
            })}
            ListProps={{
              className: clsx({
                [withBaseName("overflowMenu-dropTarget")]:
                  tabstripHook.revealOverflowedItems,
              }),
            }}
            data-overflow-indicator
            data-priority={0}
            id={overflowIndicator.id}
            isOpen={showOverflow}
            key="overflow"
            onOpenChange={handleOverflowMenuOpen}
            onKeyDown={handleKeydownOverflowMenu}
            onSelectionChange={handleOverflowSelectionChange}
            placement="bottom-end"
            source={overflowedItems}
            selected={null}
            triggerComponent={
              <Button
                aria-label={`Tabs overflow menu ${overflowCount} item${
                  overflowCount === 1 ? "" : "s"
                }`}
                variant="secondary"
                tabIndex={-1}
              >
                <OverflowIcon />
              </Button>
            }
            width="auto"
          />
        </Tooltip>,
      );
    }

    if (injectedItem) {
      content.push(
        <Button
          {...tabstripHook.navigationProps}
          aria-label={ADD_TAB_LABEL}
          data-priority={injectedItem.priority}
          data-overflowed={injectedItem.overflowed}
          id={injectedItem.id}
          key="addButton"
          onClick={handleAddTabClick}
          variant="secondary"
          tabIndex={-1}
        >
          <AddIcon />
        </Button>,
      );
    }

    return content;
  };

  const selectedTabOverflowed = overflowedItems.some(
    (item: OverflowItem) => item.index === activeTabIndex,
  );
  const className = clsx(
    withBaseName(),
    withBaseName(orientation),
    classNameProp,
    {
      [withBaseName("centered")]: centered,
      [withBaseName("draggingTab")]: tabstripHook.isDragging,
      [withBaseName("tertiary")]: variant === "tertiary",
    },
  );

  const selectedTabId =
    activeTabIndex !== null ? collectionHook.data[activeTabIndex].id : null;

  return (
    <div
      {...htmlAttributes}
      {...tabstripHook.containerProps}
      className={className}
      id={tabstripId}
      ref={root}
      role="tablist"
    >
      <div className={withBaseName("inner")} ref={innerContainerRef}>
        {renderContent()}
      </div>
      {showActivationIndicator ? (
        <TabActivationIndicator
          hideThumb={selectedTabOverflowed || tabstripHook.isDragging}
          orientation={orientation}
          tabId={selectedTabId}
        />
      ) : null}
      {tabstripHook.draggable}
    </div>
  );
});

Tabstrip.displayName = "Tabstrip";
