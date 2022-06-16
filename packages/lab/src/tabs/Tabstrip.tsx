import {
  Button,
  ButtonProps,
  makePrefixer,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import { AddIcon } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import React, {
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ListProps, ListSingleSelectionVariant } from "../list";
import {
  ManagedItem,
  OverflowMenuTabs as OverflowMenu,
  useOverflowLayout,
} from "../responsive";
import { useLayoutEffectSkipFirst } from "../utils";
import { Tab } from "./Tab";
import { TabActivationIndicator } from "./TabActivationIndicator";
import {
  responsiveDataAttributes,
  TabDescriptor,
  TabElement,
  TabProps,
  TabsSource,
  TabstripProps,
} from "./TabstripProps";
import { useTabstrip } from "./useTabstrip";

import "./Tabstrip.css";
import "./ThemeTabstrip.css";

const withBaseName = makePrefixer("uitkTabstrip");

const ADD_TAB_LABEL = "Create Tab";

const isEditable = (tab: TabDescriptor | TabElement, defaultValue = false) => {
  const value = React.isValidElement(tab) ? tab.props.editable : tab.editable;
  return value ?? defaultValue;
};

const isCloseable = (tab: TabDescriptor | TabElement, defaultValue = false) => {
  const value = React.isValidElement(tab) ? tab.props.closeable : tab.closeable;
  return value ?? defaultValue;
};

const AddTabButton = forwardRef<HTMLButtonElement, ButtonProps<"button">>(
  function AddTabButton({ title, ...props }, ref) {
    return (
      <Button {...props} ref={ref} variant="secondary" tabIndex={-1}>
        <AddIcon aria-label={title} />
      </Button>
    );
  }
);

export const Tabstrip = forwardRef(function Tabstrip(
  props: TabstripProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const root = useRef<HTMLDivElement>(null);
  const setForkRef = useForkRef(root, ref);
  const managedItemsRef = useRef<ManagedItem[]>([]);

  const {
    allowDragDrop = false,
    centered = false,
    children,
    className: classNameProp,
    defaultTabs,
    defaultValue,
    enableAddTab = false,
    enableCloseTab,
    enableRenameTab,
    keyBoardActivation = "manual",
    onAddTab,
    onChange,
    onCloseTab,
    onMoveTab,
    // doesn't feel like a great prop name ...
    noBorder = false,
    orientation = "horizontal",
    // don't like this prop name either ...
    overflowMenu = true,
    promptForNewTabName = true,
    showActivationIndicator = true,
    tabs: tabsProp,
    title,
    value: valueProp,
    ...rootProps
  } = props;

  const childCount = useRef(React.Children.count(children));

  // Simple strings for tab labels are accepted as input, convert to TabDescriptors internally
  const tabDescriptors = (
    tabs: TabsSource | undefined
  ): TabDescriptor[] | undefined =>
    tabs &&
    tabs.map((tab: string | TabDescriptor) =>
      typeof tab === "string" ? { label: tab } : tab
    );

  const getChildren = (): TabElement[] | undefined => {
    if (React.Children.count(children) === 0) {
      return undefined;
    } else {
      return React.Children.toArray(children) as TabElement[];
    }
  };

  const [selectedTab, setSelectedTab] = useState<RefObject<HTMLElement>>({
    current: null,
  });

  const [
    innerContainerRef,
    managedItems,
    updatePriorities,
    dispatchOverflowAction,
  ] = useOverflowLayout(orientation /*, buttonDescriptors */, "Tabstrip");
  managedItemsRef.current = managedItems;
  const overflowedItems = managedItems.filter((item) => item.overflowed);

  // TODO call this isEditing and make sure it's set whichever way we initiate editing
  const renameExpected = useRef(false);

  const handleTabSelectionChange = useCallback(
    (tabIndex: number) => {
      const newSelectedItem = managedItems[tabIndex];
      const prevSelectedItem = managedItems.find(
        (item) => item.priority === 1 && !item.isOverflowIndicator
      );
      const items = [{ ...newSelectedItem, priority: 1 }];
      if (prevSelectedItem) {
        items.push({ ...prevSelectedItem, priority: 3 });
      }
      updatePriorities(items);
      onChange?.(tabIndex);
    },
    [managedItems]
  );

  const tabsHook = useTabstrip({
    allowDragDrop,
    defaultTabs: tabDescriptors(defaultTabs),
    defaultValue,
    enableAddTab,
    innerContainerRef,
    keyBoardActivation,
    managedItems,
    onChange: handleTabSelectionChange,
    onMoveTab,
    orientation,
    tabs: tabDescriptors(tabsProp) ?? getChildren(),
    value: valueProp,
  });

  const selectedIndex = useRef(tabsHook.value ?? 0);
  const focusedTabIndex = tabsHook.focusedIndex;
  const handleOverflowChange: ListProps<
    ManagedItem,
    ListSingleSelectionVariant
  >["onChange"] = (e, tab) => {
    if (tab !== null) {
      tabsHook.activateTab(tab.index);
    }
  };

  const addTab = useCallback(
    (indexPosition = tabsHook.tabs.length) => {
      tabsHook.setTabs(
        (tabsHook.tabs as TabDescriptor[]).concat({ label: "New Tab" })
      );

      if (!tabsHook.controlledSelection) {
        //TODO how do we determine the default label ?
        tabsHook.activateTab(indexPosition);
        // TODO should we need this to be able to set initial name ?
        if (enableRenameTab) {
          tabsHook.setEditing(true);
        }
      }

      onAddTab && onAddTab();

      if (promptForNewTabName) {
        renameExpected.current = true;
      }
    },
    [
      tabsHook.activateTab,
      tabsHook.controlledSelection,
      enableRenameTab,
      onAddTab,
      promptForNewTabName,
      tabsHook.setEditing,
      tabsHook.setTabs,
      tabsHook.tabs,
    ]
  );

  const clickAddTab = useCallback(
    (e) => {
      addTab();
    },
    [addTab]
  );

  const navItemsCount = useCallback(
    () =>
      tabsHook.navItemRefs.current === null
        ? 0
        : tabsHook.navItemRefs.current.length,
    [tabsHook.navItemRefs]
  );

  const indexOfAddButton = useCallback(
    // If there are no navItems, we return -1, this is intended
    () => navItemsCount() - 1,
    [navItemsCount]
  );

  const addButtonRef = useCallback(
    () =>
      tabsHook.navItemRefs.current?.[
        indexOfAddButton()
      ] as RefObject<HTMLButtonElement>,
    [indexOfAddButton, tabsHook.navItemRefs]
  );

  const handleKeydownAddTab = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const idx = indexOfAddButton();
      tabsHook.tabProps?.onKeyDown?.(e, idx);
    },
    [indexOfAddButton, tabsHook.tabProps]
  );

  const closeTab: TabProps["onClose"] = (index) => {
    if (tabsHook.tabs.length > 1) {
      if (index === tabsHook.value && index === tabsHook.tabs.length - 1) {
        tabsHook.activateTab(index - 1);
      }
      onCloseTab && onCloseTab(index);

      if (index < tabsHook.value) {
        tabsHook.activateTab(tabsHook.value - 1);
      }
    }
  };

  // shouldn't we use ref for this ?
  useIsomorphicLayoutEffect(() => {
    // We don't care about changes to overflowedItems here, the overflowObserver
    // always does the right thing. We only care about changes to selected tab
    if (selectedIndex.current !== tabsHook.value && overflowMenu) {
      // We might want to do this only if the selected tab is overflowed ?
      // TODO
      // resetOverflow();
      selectedIndex.current = tabsHook.value;
    }
  }, [overflowMenu, tabsHook.value]);

  useIsomorphicLayoutEffect(() => {
    if (React.Children.count(children) !== childCount.current) {
      childCount.current = React.Children.count(children);
      // TODO
      // resetOverflow();
    }
  }, [children]);

  useIsomorphicLayoutEffect(() => {
    if (focusedTabIndex !== tabsHook.value && focusedTabIndex !== -1) {
      tabsHook.focusTab(tabsHook.value);
    }
    // We only want the effect to run when value changes, not every time focusedTabIndex changes.
    // It doesn't matter if focusedTabIndex is stale in between calls - it will be correct when
    // value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsHook.value]);

  useLayoutEffectSkipFirst(() => {
    console.log(
      `%cTabstrip layout effect ${tabsHook.tabs.length} tabs`,
      "color:brown;font-weight:bold;"
    );
    dispatchOverflowAction({ type: "reset" });
  }, [tabsHook.tabs.length]);

  const renderContent = () => {
    const content = tabsHook.tabs.map(
      (tab: TabDescriptor | TabElement, index: number) => {
        const selected = index === tabsHook.value;
        const focusVisible = focusedTabIndex === index;
        const focusAway = focusedTabIndex === -1;
        const overflowed =
          overflowedItems.findIndex(
            (item: ManagedItem) => item.index === index
          ) !== -1;
        const editable =
          isEditable(tab, enableRenameTab) ?? enableRenameTab ?? false;
        const closeable =
          isCloseable(tab, enableCloseTab) ?? enableCloseTab ?? false;

        const baseProps: Partial<TabProps> &
          responsiveDataAttributes & {
            ref?: RefObject<HTMLDivElement>;
            key: string | number;
          } = {
          index,
          ...tabsHook.tabProps,
          closeable,
          "data-index": index,
          "data-priority": selected ? 1 : 3,
          "data-overflowed": overflowed ? true : undefined,
          dragging: tabsHook.draggedItemIndex === index,
          editable,
          editing: tabsHook.editing && selected,
          focusVisible,
          key: index,
          onClose: closeable ? closeTab : undefined,
          onMouseDown: tabsHook.onMouseDown,
          orientation,
          ref: tabsHook.navItemRefs.current?.[
            index
          ] as RefObject<HTMLDivElement>,
          selected,
          tabIndex: selected && (focusVisible || focusAway) ? 0 : -1,
        };

        if (React.isValidElement(tab)) {
          return React.cloneElement(tab, baseProps);
        } else if (typeof tab === "string") {
          return React.createElement(Tab, {
            ...baseProps,
            label: tab,
          });
        } else {
          //@ts-ignore tab can only be a TabDescriptor here, but TypeScript seems to think it can be a number
          return React.createElement(Tab, { ...baseProps, label: tab.label });
        }
      }
    );

    if (overflowMenu) {
      const overflowCount = overflowedItems.length;
      content.push(
        <OverflowMenu
          aria-label={`Tabs overflow menu ${overflowCount} item${
            overflowCount === 1 ? "" : "s"
          }`}
          ButtonProps={{ tabIndex: -1 }}
          className={withBaseName("overflowMenu")}
          data-priority={0}
          data-index={tabsHook.tabs.length}
          data-overflow-indicator
          key="overflow"
          onChange={handleOverflowChange}
          onKeyDown={(e: React.KeyboardEvent) =>
            tabsHook.tabProps?.onKeyDown?.(e, tabsHook.tabs.length)
          }
          // @ts-ignore
          ref={tabsHook.navItemRefs.current?.[tabsHook.tabs.length]}
          source={overflowedItems}
        />
      );
    }

    if (enableAddTab) {
      content.push(
        <AddTabButton
          aria-label={ADD_TAB_LABEL}
          data-priority={2}
          data-index={tabsHook.tabs.length}
          key="Tabstrip-addButton"
          onClick={clickAddTab}
          onKeyDown={handleKeydownAddTab}
          ref={addButtonRef()}
          title={title}
        />
      );
    }

    return content;
  };

  const { current: navItems } = tabsHook.navItemRefs;
  useEffect(() => {
    if (navItems !== null) {
      setSelectedTab(navItems[tabsHook.value]);
    }
  }, [navItems, tabsHook.value]);

  const selectedTabOverflowed = overflowedItems.some(
    (item: ManagedItem) => item.index === tabsHook.value
  );
  const className = cx(
    withBaseName(),
    withBaseName(orientation),
    classNameProp,
    {
      [withBaseName("centered")]: centered,
      [withBaseName("draggingTabNatural")]:
        tabsHook.isDragging && allowDragDrop !== "drop-indicator",
      [withBaseName("draggingTabIndicator")]:
        tabsHook.isDragging && allowDragDrop === "drop-indicator",
    }
  );

  return (
    <div {...rootProps} className={className} ref={setForkRef} role="tablist">
      <div
        className={withBaseName("inner")}
        ref={innerContainerRef}
        style={{ lineHeight: "36px" }}
      >
        {renderContent()}
      </div>
      {showActivationIndicator ? (
        <TabActivationIndicator
          hideThumb={selectedTabOverflowed || tabsHook.isDragging}
          hideBackground={noBorder}
          orientation={orientation}
          tabRef={selectedTab}
        />
      ) : null}
      {tabsHook.dropIndicator}
      {tabsHook.draggable}
    </div>
  );
});

Tabstrip.displayName = "Tabstrip";
