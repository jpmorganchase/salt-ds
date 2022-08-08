import {
  Button,
  makePrefixer,
  Tooltip,
  useIdMemo,
  useIsomorphicLayoutEffect,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { AddIcon, OverflowMenuIcon } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import React, {
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { SelectionChangeHandler } from "../common-hooks";

import { Dropdown } from "../dropdown";
import {
  InjectedSourceItem,
  OverflowItem,
  useOverflowLayout,
} from "../responsive";
import { useOverflowCollectionItems } from "../responsive/useOverflowCollectionItems";
import { Tab } from "./Tab";
import { TabActivationIndicator } from "./TabActivationIndicator";
import {
  FocusAPI,
  responsiveDataAttributes,
  TabDescriptor,
  TabElement,
  TabProps,
  TabsSource,
  TabstripProps,
} from "./TabsTypes";
import { useTabstrip } from "./useTabstrip";

import "./Tabstrip.css";
import "./ThemeTabstrip.css";

const withBaseName = makePrefixer("uitkTabstrip");

const ADD_TAB_LABEL = "Create Tab";

// Simple strings for tab labels are accepted as input, convert to TabDescriptors internally
const tabDescriptors = (
  tabs: TabsSource | undefined
): TabDescriptor[] | undefined =>
  tabs &&
  tabs.map((tab: string | TabDescriptor) =>
    typeof tab === "string" ? { label: tab } : tab
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
    emphasis,
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
    onMoveTab,
    orientation = "horizontal",
    overflowMenu: overflowMenuProp = true,
    promptForNewTabName = true,
    showActivationIndicator = true,
    source,
    title,
    ...htmlAttributes
  }: TabstripProps,
  forwardedRef: ForwardedRef<FocusAPI>
) {
  const root = useRef<HTMLDivElement>(null);
  // can't use forwardedRef here, can we ?
  // const setForkRef = useForkRef(root, forwardedRef);
  const activeRef = useRef<number>(
    activeTabIndexProp || defaultActiveTabIndex || 0
  );

  const overflowItemsRef = useRef<OverflowItem[]>([]);
  const [showOverflowMenu, _setShowOverflowMenu] = useState(false);

  const setShowOverflowMenu = useCallback((value) => {
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

  const childCount = useRef(React.Children.count(children));

  const getChildren = (): TabElement[] | undefined => {
    if (React.Children.count(children) === 0) {
      return undefined;
    } else {
      return React.Children.toArray(children) as TabElement[];
    }
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
    [collectionHook, onMoveTab]
  );

  const handleTabSelectionChange = useCallback(
    (tabIndex: number) => {
      const selectedItem = collectionHook.data[tabIndex];
      const prevSelectedItem = collectionHook.data.find(
        (item) => item.priority === 1 && !item.isOverflowIndicator
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
    ]
  );

  const { getTriggerProps, getTooltipProps } = useTooltip({});

  const { activeTabIndex, activateTab, addTab, ...tabstripHook } = useTabstrip({
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
              '.uitkTab[aria-selected="true"]'
            ) as HTMLElement;
            if (selectedTab) {
              selectedTab.focus();
            }
          }
        },
      } as FocusAPI),
    []
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
      [activateTab]
    );

  const handleKeydownOverflowMenu = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      tabstripHook.navigationProps?.onKeyDown?.(e);
    },
    [tabstripHook.navigationProps]
  );

  const handleOverflowMenuOpen = useCallback((open) => {
    setShowOverflowMenu(open);
  }, []);

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
    if (React.Children.count(children) !== childCount.current) {
      childCount.current = React.Children.count(children);
      // TODO
      // resetOverflow();
    }
  }, [children]);

  useIsomorphicLayoutEffect(() => {
    if (focusedTabIndex !== activeTabIndex && focusedTabIndex !== -1) {
      tabstripHook.focusTab(activeTabIndex);
    }

    // We only want the effect to run when value changes, not every time focusedTabIndex changes.
    // It doesn't matter if focusedTabIndex is stale in between calls - it will be correct when
    // value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            (item: OverflowItem) => item.index === index
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
          onMouseDown: tabstripHook.onMouseDown,
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

        if (React.isValidElement(element)) {
          if (element.type === Tab) {
            return React.cloneElement(element, { ...baseProps, ...tabProps });
          } else {
            return React.cloneElement(element, baseProps);
          }
        } else {
          //@ts-ignore tab can only be a TabDescriptor here, but TypeScript seems to think it can be a number
          return React.createElement(Tab, {
            ...baseProps,
            ...tabProps,
            label: tab.label,
          });
        }
      });

    const overflowCount = overflowedItems.length;
    const draggingActiveTab = tabstripHook.draggedItemIndex === activeTabIndex;
    const showOverflow =
      (tabstripHook.revealOverflowedItems && !draggingActiveTab) ||
      showOverflowMenu;
    const showTooltip = tabstripHook.revealOverflowedItems && draggingActiveTab;
    const overflowIndicator = collectionHook.data.find(
      (i) => i.isOverflowIndicator
    );
    const [injectedItem] = collectionHook.data.filter((i) => i.isInjectedItem);

    if (overflowIndicator) {
      const triggerProps = getTriggerProps<typeof Button>();
      content.push(
        <Dropdown<OverflowItem>
          className={cx(withBaseName("overflowMenu"), {
            [withBaseName("overflowMenu-open")]: showOverflow,
          })}
          ListProps={{
            className: cx({
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
              {...triggerProps}
              aria-label={`Tabs overflow menu ${overflowCount} item${
                overflowCount === 1 ? "" : "s"
              }`}
              variant="secondary"
              tabIndex={-1}
            >
              <OverflowMenuIcon />
            </Button>
          }
          width="auto"
        />
      );
      if (showTooltip) {
        content.push(
          <Tooltip
            {...getTooltipProps({
              title: "Active Tab cannot be moved into overflow list",
              open: true,
              state: "warning",
            })}
            key="tooltip"
          />
        );
      }
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
        </Button>
      );
    }

    return content;
  };

  const selectedTabOverflowed = overflowedItems.some(
    (item: OverflowItem) => item.index === activeTabIndex
  );
  const className = cx(
    withBaseName(),
    withBaseName(orientation),
    classNameProp,
    {
      [withBaseName("centered")]: centered,
      [withBaseName("draggingTab")]: tabstripHook.isDragging,
      uitkEmphasisLow: emphasis === "low",
    }
  );

  const { id: selectedTabId } = collectionHook.data[activeTabIndex];

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
