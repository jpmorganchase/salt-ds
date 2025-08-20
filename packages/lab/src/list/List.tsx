import { makePrefixer, useForkRef, useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  cloneElement,
  type ForwardedRef,
  forwardRef,
  isValidElement,
  type ReactElement,
  useRef,
} from "react";
import {
  type CollectionIndexer,
  type CollectionItem,
  itemToString as defaultItemToString,
  isSelected,
  LIST_FOCUS_VISIBLE,
  type ScrollingAPI,
  type SelectionStrategy,
  useCollectionItems,
  useImperativeScrollingAPI,
} from "../common-hooks";
import listCss from "./List.css";
import { ListItem as DefaultListItem, ListItemProxy } from "./ListItem";
import type { ListItemProps, ListProps } from "./listTypes";
import { useList } from "./useList";
import { useListHeight } from "./useListHeight";

const defaultEmptyMessage = "No data to display";

const withBaseName = makePrefixer("saltList");

export const List = forwardRef(function List<
  Item,
  Selection extends SelectionStrategy = "default",
>(
  {
    ListItem = DefaultListItem,
    ListPlaceholder,
    borderless,
    children,
    className,
    collapsibleHeaders = false,
    defaultHighlightedIndex,
    defaultSelected,
    disabled: listDisabled = false,
    disableFocus = false,
    disableTypeToSelect,
    displayedItemCount = 10,
    emptyMessage,
    focusVisible: focusVisibleProp,
    getItemHeight: getItemHeightProp,
    getItemId,
    height,
    highlightedIndex: highlightedIndexProp,
    id: idProp,
    itemGapSize = 0,
    itemHeight: itemHeightProp,
    itemTextHighlightPattern,
    itemToString = defaultItemToString,
    listHandlers: listHandlersProp,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    onSelect,
    onSelectionChange,
    onHighlight,
    restoreLastFocus,
    selected: selectedProp,
    selectionStrategy,
    checkable = selectionStrategy === "multiple",
    scrollingApiRef,
    // TODO do we still need these ?
    selectionKeys,
    showEmptyMessage = false,
    source,
    style: styleProp,
    stickyHeaders,
    tabToSelect,
    width,
    ...htmlAttributes
  }: ListProps<Item, Selection>,
  forwardedRef?: ForwardedRef<HTMLDivElement>,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-list",
    css: listCss,
    window: targetWindow,
  });

  const id = useIdMemo(idProp);
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rowHeightProxyRef = useRef<HTMLDivElement>(null);

  const collectionHook = useCollectionItems<Item>({
    id,
    label: "List",
    source,
    children,
    options: {
      collapsibleHeaders,
      // Add Group ChildTypes to options
      getItemId,
      itemToString,
    },
  });

  const { preferredHeight } = useListHeight({
    borderless,
    displayedItemCount,
    getItemHeight: getItemHeightProp,
    height,
    itemCount: collectionHook.data.length,
    itemGapSize,
    itemHeight: itemHeightProp,
    rowHeightRef: rowHeightProxyRef,
  });

  const {
    focusVisible,
    highlightedIndex,
    listControlProps,
    listHandlers,
    listItemHeaderHandlers,
    scrollIntoView,
    selected,
  } = useList<Item, Selection>({
    collapsibleHeaders,
    collectionHook,
    containerRef: rootRef,
    contentRef,
    defaultHighlightedIndex,
    defaultSelected: collectionHook.itemToCollectionItem<
      Selection,
      typeof defaultSelected
    >(defaultSelected),
    disabled: listDisabled,
    disableTypeToSelect,
    highlightedIndex: highlightedIndexProp,
    label: id,
    listHandlers: listHandlersProp, // should this be in context ?
    onSelect,
    onSelectionChange,
    onHighlight,
    restoreLastFocus,
    selected: collectionHook.itemToCollectionItem<
      Selection,
      typeof defaultSelected
    >(selectedProp),
    selectionStrategy,
    selectionKeys,
    stickyHeaders,
    tabToSelect,
  });

  useImperativeScrollingAPI({
    collectionHook,
    forwardedRef: scrollingApiRef,
    scrollableRef: rootRef,
    scrollIntoView,
  });

  // focusVisible passes as a prop takes precedence
  const appliedFocusVisible = focusVisibleProp ?? focusVisible;

  const createHeader: (
    idx: { value: number },
    headerId: string,
    title: string,
    expanded?: boolean,
  ) => ReactElement = function createHeader(idx, headerId, title, expanded) {
    const header = (
      <ListItem
        {...listItemHeaderHandlers}
        className={clsx("saltListItemHeader", {
          focusVisible: collapsibleHeaders && appliedFocusVisible === idx.value,
        })}
        aria-expanded={expanded}
        data-idx={collapsibleHeaders ? idx.value : undefined}
        data-highlighted={idx.value === highlightedIndex || undefined}
        data-sticky={stickyHeaders}
        data-selectable={false}
        id={headerId}
        key={`header-${idx.value}`}
        label={title}
        // role="presentation"
      />
    );
    idx.value += 1;
    return header;
  };

  const getItemHeight =
    getItemHeightProp === undefined ? () => itemHeightProp : getItemHeightProp;

  function renderCollectionItem(
    list: ReactElement[],
    item: CollectionItem<Item>,
    idx: { value: number },
  ) {
    // Note, a number of these props are specific to ListItem. What if user
    // implements a custom ListItem but neglects to handle all these props.
    // Is that on them ?
    const { disabled, value, id: itemId, label } = item;
    const isChildItem = isValidElement(value);
    const listItemProps: ListItemProps<Item> & {
      key: string;
      "data-idx": number;
    } = {
      className: clsx({
        saltHighlighted: idx.value === highlightedIndex,
        saltFocusVisible: appliedFocusVisible === idx.value,
      }),
      disabled: disabled || listDisabled,
      id: itemId,
      item: isChildItem ? undefined : (item?.value ?? undefined),
      itemHeight: getItemHeight(idx.value),
      itemTextHighlightPattern,
      key: itemId,
      "data-idx": idx.value,
      label,
      role: "option",
      selected: isSelected<Item>(selected, item),
      showCheckbox: checkable,
    };
    list.push(
      isChildItem ? (
        cloneElement(value, listItemProps)
      ) : (
        <ListItem {...listItemProps} />
      ),
    );

    idx.value += 1;
  }

  const addGroup: (
    list: ReactElement[],
    items: CollectionItem<Item>[],
    idx: { value: number },
  ) => void = function addGroup(
    list: ReactElement[],
    items: CollectionItem<Item>[],
    idx: { value: number },
  ) {
    const { count = 0, id, expanded, label = "" } = items[idx.value];
    const header = createHeader(idx, id, label, expanded);
    const childItems: ReactElement | ReactElement[] =
      expanded !== false
        ? [header].concat(
            renderCollectionItems(items, idx, idx.value + count) || [],
          )
        : header;

    list.push(
      <div key={id} role="group">
        {childItems}
      </div>,
    );
  };

  const renderCollectionItems = (
    items: CollectionItem<Item>[],
    idx: CollectionIndexer = { value: 0 },
    end = items.length,
  ): ReactElement[] | undefined => {
    const listItems: ReactElement[] = [];
    while (idx.value < end) {
      const item = items[idx.value];
      if (item.header && item.label != null) {
        listItems.push(
          createHeader(idx, item.id, item.label, item.expanded === false),
        );
      } else if (item.childNodes) {
        addGroup(listItems, items, idx);
      } else {
        renderCollectionItem(listItems, item, idx);
      }
    }
    return listItems;
  };

  function renderEmpty() {
    if (emptyMessage || showEmptyMessage) {
      return (
        <span className={withBaseName("empty-message")}>
          {emptyMessage ?? defaultEmptyMessage}
        </span>
      );
    }
    return null;
  }

  const renderContent = () => {
    if (collectionHook.data.length) {
      return renderCollectionItems(collectionHook.data);
    }
    renderEmpty();
  };

  const contentHeight = "auto";
  const sizeStyles = {
    "--list-item-gap": itemGapSize ? `${itemGapSize}px` : undefined,
    minWidth,
    minHeight,
    width: width ?? "100%",
    height: height ?? "100%",
    maxWidth: maxWidth ?? width,
    maxHeight: maxHeight ?? preferredHeight,
  };
  return (
    <div
      aria-multiselectable={
        selectionStrategy === "multiple" ||
        selectionStrategy === "extended" ||
        selectionStrategy === "extended-multi-range" ||
        undefined
      }
      {...htmlAttributes}
      {...listHandlers}
      {...listControlProps}
      className={clsx(withBaseName(), className, {
        // TODO low-emphasis
        [withBaseName("borderless")]: borderless,
        saltDisabled: listDisabled,
        [withBaseName("collapsible")]: collapsibleHeaders,
        saltFocusVisible: highlightedIndex === LIST_FOCUS_VISIBLE,
      })}
      id={`${id}`}
      ref={useForkRef<HTMLDivElement>(rootRef, forwardedRef)}
      role="listbox"
      style={{ ...styleProp, ...sizeStyles }}
      tabIndex={listDisabled || disableFocus ? undefined : 0}
    >
      <ListItemProxy ref={rowHeightProxyRef} />
      {collectionHook.data.length === 0 && ListPlaceholder !== undefined ? (
        <ListPlaceholder />
      ) : (
        <div
          className={withBaseName("scrollingContentContainer")}
          ref={contentRef}
          style={{ height: contentHeight }}
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
}) as <Item = string, Selection extends SelectionStrategy = "default">(
  props: ListProps<Item, Selection> & {
    ref?: ForwardedRef<ScrollingAPI<Item>>;
  },
) => ReactElement<ListProps<Item, Selection>>;
